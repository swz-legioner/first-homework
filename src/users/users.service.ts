import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, ILike, Repository } from 'typeorm';

import { SignUpUserDto } from '../auth/dto/sign-up-user.dto';

import { USERS_PAGE_SIZE } from './const/users-page-size';
import { User } from './user.entity';

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

    async findOneStrict(user: Partial<User>, onlyPublic: boolean = true) {
        const found = await this.findOne(user, onlyPublic);
        if (!found) {
            throw new NotFoundException(`User not found`);
        }
        return found;
    }

    async insertOne(data: SignUpUserDto): Promise<User['id']> {
        const { identifiers } = await this.usersRepository.insert(data);
        return identifiers[0].id as User['id'];
    }

    async updateOne(id: User['id'], user: Partial<User>) {
        await this.usersRepository.update({ id }, user);
        return;
    }

    async deleteOne(id: User['id']) {
        await this.usersRepository.softDelete(id);
        return;
    }

    async findAll(filter: string = '', page: number = 1) {
        const options: FindManyOptions<User> = {
            select: PublicUserColumns,
        };

        if (filter) {
            options.where = {
                username: ILike(`%${filter}%`),
            };
        }

        const usersCount = await this.usersRepository.count({
            ...options,
        });
        if (usersCount === 0) {
            return {
                users: [],
                maxPage: 0,
            };
        }

        const maxPage = Math.ceil(usersCount / USERS_PAGE_SIZE);

        if (page <= 0 || page > maxPage) {
            throw new BadRequestException(
                `The page should be in the range from 1 to ${maxPage}`,
            );
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
