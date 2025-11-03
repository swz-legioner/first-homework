import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    DataSource,
    FindManyOptions,
    FindOneOptions,
    ILike,
    Or,
    Repository,
} from 'typeorm';
import bcrypt from 'bcrypt';

import { UserNotFoundError } from '../errors/UserNotFound';
import { BadPageError } from './errors/bad-page';

import { SignUpUserDto } from '../auth/dto/sign-up-user.dto';

import { USERS_PAGE_SIZE } from './const/users-page-size';
import { User } from './user.entity';
import { ExpectedNothingUpdatedError } from './errors/expected-nothing-updated';
import { UnexpectedNothingUpdatedError } from './errors/unexpected-nothing-updated';
import { UnexpectedNothingDeletedError } from './errors/unexpected-nothing-deleted';

const PublicUserColumns: (keyof User)[] = [
    'id',
    'username',
    'email',
    'age',
    'description',
];

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private dataSource: DataSource,
    ) {}

    async findOne(
        user: Partial<User>,
        onlyPublic: boolean = true,
    ): Promise<User | null> {
        const options: FindOneOptions<User> = {
            where: user,
        };
        if (onlyPublic) {
            options.select = PublicUserColumns;
        }
        return await this.usersRepository.findOne(options);
    }

    async findById(id: User['id'], onlyPublic: boolean = true) {
        return this.findOne({ id }, onlyPublic);
    }

    async findByName(username: User['username'], onlyPublic: boolean = true) {
        return this.findOne({ username }, onlyPublic);
    }

    async findByEmail(email: User['email'], onlyPublic: boolean = true) {
        return this.findOne({ email }, onlyPublic);
    }

    async createOne(data: SignUpUserDto): Promise<User['id']> {
        const qr = this.dataSource.createQueryRunner();

        await qr.connect();
        await qr.startTransaction();

        try {
            const user = new User();
            Object.assign(user, data);
            await qr.manager.save(user);

            await qr.commitTransaction();

            return user.id;
        } catch (err) {
            await qr.rollbackTransaction();
            throw err;
        } finally {
            await qr.release();
        }
    }

    async updateOne(id: User['id'], user: Partial<User>) {
        const currentUser = await this.findById(id, false);
        if (currentUser === null) {
            throw new UserNotFoundError();
        }

        const forUpdate: Partial<User> = {};
        for (const key of Object.keys(user) as (keyof User)[]) {
            if (key === 'id') continue;
            if (!user[key]) continue;
            if (key === 'password' && user.password) {
                const passwordsMatch = await bcrypt.compare(
                    user.password,
                    currentUser.password,
                );

                if (passwordsMatch) {
                    continue;
                }
            } else if (currentUser[key] === user[key]) continue;

            Object.assign(forUpdate, { [key]: user[key] });
        }

        if (Object.keys(forUpdate).length === 0) {
            throw new ExpectedNothingUpdatedError();
        }

        const { affected } = await this.usersRepository.update(
            { id },
            forUpdate,
        );
        if (affected !== 1) {
            throw new UnexpectedNothingUpdatedError();
        }
        return;
    }

    async deleteOne(id: User['id']) {
        const currentUser = await this.findById(id);
        if (currentUser === null) {
            throw new UserNotFoundError();
        }

        const { affected } = await this.usersRepository.softDelete(id);
        if (affected !== 1) {
            throw new UnexpectedNothingDeletedError();
        }
        return;
    }

    async findAll(filter: string = '', page: number = 1) {
        const options: FindManyOptions<User> = {
            select: PublicUserColumns,
        };

        if (filter) {
            options.where = {
                username: Or(ILike(`%${filter}%`)),
            };
        }

        const usersCount = await this.usersRepository.count({
            ...options,
        });
        if (usersCount === 0) {
            return {
                users: [],
                maxPage: 1,
            };
        }

        const maxPage = Math.ceil(usersCount / USERS_PAGE_SIZE);

        if (page <= 0 || page > maxPage) {
            throw new BadPageError();
        }

        return {
            users: await this.usersRepository.find({
                ...options,
                skip: (page - 1) * USERS_PAGE_SIZE,
                take: USERS_PAGE_SIZE,
            }),
            maxPage,
        };
    }
}
