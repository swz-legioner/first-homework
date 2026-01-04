import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    FindManyOptions,
    FindOneOptions,
    ILike,
    Repository,
    SelectQueryBuilder,
} from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { User } from './user.entity';

import { Avatar } from './avatars.entity';

import { SignUpUserDto } from '../auth/dto/sign-up-user.dto';

import { USERS_PAGE_SIZE } from './const/users-page-size';

import { IFileService } from 'src/providers/files/files.adapter';
import { IUploadedMulterFile } from 'src/providers/files/s3/interfaces/upload-file.interface';

const PublicUserColumns: (keyof User)[] = [
    'id',
    'username',
    'email',
    'age',
    'description',
];

@Injectable()
export class UsersService {
    private storageAvatarsFolder = 'avatars';

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Avatar)
        private avatarsRepository: Repository<Avatar>,
        private fileService: IFileService,
    ) {}

    private async _findOne(
        user: Partial<User>,
        options?: Omit<FindOneOptions<User>, 'where'>,
    ) {
        try {
            return await this.usersRepository.findOne({
                where: user,
                ...options,
            });
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async findOne(
        user: Partial<User>,
        onlyPublic: boolean = true,
    ): Promise<User | null> {
        const options: FindOneOptions<User> = {};
        if (onlyPublic) {
            options.select = PublicUserColumns;
        }
        return await this._findOne(user, options);
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

    async getAvatars(id: User['id']) {
        const avatars = await this.avatarsRepository.find({
            where: { user: { id } },
            relations: { user: true },
        });

        return avatars.map((avatar) => ({
            name: avatar.filename,
            created: avatar.createdDate,
        }));
    }

    async uploadAvatar(id: User['id'], file: IUploadedMulterFile) {
        const user = await this._findOne({ id });
        if (user === null) {
            // Может произойти, если успели удалить юзера в окно действия accessToken
            // Такому пользователю не даем нормальные ответы
            return;
        }

        const [avatars, count] = await this.avatarsRepository.findAndCount({
            where: { user: { id } },
            relations: { user: true },
        });

        if (count === 5) {
            throw new BadRequestException('');
        }

        if (avatars.map((e) => e.filename).includes(file.originalname)) {
            // Если такой уже есть - игнорируем
            return;
        }

        try {
            await this.fileService.uploadFile({
                file,
                folder: this.storageAvatarsFolder,
                name: file.originalname,
            });
        } catch (e) {
            const message = (e as Error).message;
            throw new InternalServerErrorException(message);
        }

        try {
            await this.avatarsRepository.insert({
                user,
                filename: file.originalname,
            });
        } catch (e) {
            await this.fileService.removeFile({
                path: `${this.storageAvatarsFolder}/${file.originalname}`,
            });

            const message = (e as Error).message;
            throw new InternalServerErrorException(message);
        }

        return;
    }

    async removeAvatar(id: User['id'], name: Avatar['filename']) {
        const avatar = await this.avatarsRepository.findOne({
            where: { user: { id }, filename: name },
            relations: { user: true },
        });
        if (!avatar) {
            return;
        }

        await this.avatarsRepository.softDelete(avatar.id);

        await this.fileService.removeFile({
            path: `${this.storageAvatarsFolder}/${name}`,
        });
    }

    async findMostActive(from: User['age'], to: User['age']) {
        const users: Array<
            Pick<User, 'username' | 'email' | 'age' | 'description'> & {
                lastAvatar: Avatar['filename'];
            }
        > = await this.usersRepository
            .createQueryBuilder('u')
            .select('u.username', 'username')
            .addSelect('u.email', 'email')
            .addSelect('u.age', 'age')
            .addSelect('u.description', 'description')
            .addSelect((qb: SelectQueryBuilder<Avatar>) => {
                return qb
                    .subQuery()
                    .select('a.filename')
                    .from('avatars', 'a')
                    .where(`a."userId"=u.id`)
                    .andWhere('a."deletedDate" IS NULL')
                    .addOrderBy('a."createdDate"', 'DESC')
                    .limit(1);
            }, 'lastAvatar')
            .innerJoin(
                'avatars',
                'a',
                'a."userId" = u.id AND a."deletedDate" IS NULL',
            )
            .where(`u.description <> ''`)
            .andWhere(`u.age BETWEEN :from AND :to`, {
                from,
                to,
            })
            .groupBy('u.id')
            .having('COUNT(a.id) > 2')
            .getRawMany();

        return users;
    }

    @Transactional()
    async sendMoney(source: User['id'], target: User['id'], amount: number) {
        const sourceUser = (await this.usersRepository.findOne({
            where: {
                id: source,
            },
        })) as User;

        const sourceNewBalance = Number(sourceUser.balance) - amount;
        sourceUser.balance = String(sourceNewBalance);

        try {
            await this.usersRepository.save(sourceUser);
        } catch {
            throw new InternalServerErrorException('Failed to withdraw funds');
        }
        const targetUser = await this.usersRepository.findOne({
            where: {
                id: target,
            },
        });
        if (!targetUser) {
            throw new BadRequestException('Target user not found');
        }

        const targetNewBalance = Number(targetUser.balance) + amount;
        targetUser.balance = String(targetNewBalance);

        await this.usersRepository.save(targetUser);
    }

    async getBalance(id: User['id']) {
        return await this._findOne({ id }, { select: ['balance'] });
    }
}
