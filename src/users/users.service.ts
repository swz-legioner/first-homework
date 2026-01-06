import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
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
    private readonly logger = new Logger(UsersService.name);

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
            this.logger.error(
                `Find user failed criteria=${JSON.stringify(user)}: ${
                    e instanceof Error ? e.message : e
                }`,
            );
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
            this.logger.warn(`User not found criteria=${JSON.stringify(user)}`);
            throw new NotFoundException(`User not found`);
        }
        return found;
    }

    async insertOne(data: SignUpUserDto): Promise<User['id']> {
        this.logger.log(
            `Insert user record attempt username=${data.username} email=${data.email}`,
        );
        const { identifiers } = await this.usersRepository.insert(data);
        const id = identifiers[0].id as User['id'];
        this.logger.log(`Insert user record success userId=${id}`);
        return id;
    }

    async updateOne(id: User['id'], user: Partial<User>) {
        this.logger.log(`Update user record attempt userId=${id}`);
        await this.usersRepository.update({ id }, user);
        this.logger.log(`Update user record success userId=${id}`);
    }

    async deleteOne(id: User['id']) {
        this.logger.log(`Delete user record attempt userId=${id}`);
        await this.usersRepository.softDelete(id);
        this.logger.log(`Delete user record success userId=${id}`);
    }

    async findAll(filter: string = '', page: number = 1) {
        this.logger.log(
            `List users attempt filter=${filter || 'none'} page=${page}`,
        );
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
            this.logger.log(
                `List users success filter=${filter || 'none'} page=${page} count=0`,
            );
            return {
                users: [],
                maxPage: 0,
            };
        }

        const maxPage = Math.ceil(usersCount / USERS_PAGE_SIZE);

        if (page <= 0 || page > maxPage) {
            this.logger.warn(
                `List users failed filter=${filter || 'none'} page=${page}: invalid page`,
            );

            throw new BadRequestException(
                `The page should be in the range from 1 to ${maxPage}`,
            );
        }

        this.logger.log(
            `List users success filter=${filter || 'none'} page=${page} count=${usersCount}`,
        );

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
        this.logger.log(`Get avatars attempt userId=${id}`);

        const avatars = await this.avatarsRepository.find({
            where: { user: { id } },
            relations: { user: true },
        });

        this.logger.log(
            `Get avatars success userId=${id} count=${avatars.length}`,
        );

        return avatars.map((avatar) => ({
            name: avatar.filename,
            created: avatar.createdDate.toISOString(),
        }));
    }

    async uploadAvatar(id: User['id'], file: IUploadedMulterFile) {
        this.logger.log(
            `Upload avatar attempt userId=${id} filename=${file.originalname}`,
        );

        const user = await this._findOne({ id });
        if (user === null) {
            this.logger.warn(
                `Upload avatar skipped userId=${id}: user not found`,
            );
            // Может произойти, если успели удалить юзера в окно действия accessToken
            // Такому пользователю не даем нормальные ответы
            return;
        }

        const [avatars, count] = await this.avatarsRepository.findAndCount({
            where: { user: { id } },
            relations: { user: true },
        });

        if (count === 5) {
            this.logger.warn(
                `Upload avatar failed userId=${id}: avatar limit reached`,
            );
            throw new BadRequestException('TODO: сюда тоже ошибке');
        }

        if (avatars.map((e) => e.filename).includes(file.originalname)) {
            this.logger.warn(
                `Upload avatar skipped userId=${id} filename=${file.originalname}: duplicate filename`,
            );
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
            this.logger.error(
                `Upload avatar failed userId=${id} filename=${file.originalname}: ${message}`,
            );
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
            this.logger.error(
                `Insert avatar record failed userId=${id} filename=${file.originalname}: ${message}`,
            );
            throw new InternalServerErrorException(message);
        }

        this.logger.log(
            `Upload avatar success userId=${id} filename=${file.originalname}`,
        );

        return;
    }

    async removeAvatar(id: User['id'], name: Avatar['filename']) {
        this.logger.log(`Remove avatar attempt userId=${id} filename=${name}`);
        const avatar = await this.avatarsRepository.findOne({
            where: { user: { id }, filename: name },
            relations: { user: true },
        });
        if (!avatar) {
            this.logger.warn(
                `Remove avatar skipped userId=${id} filename=${name}: not found`,
            );
            return;
        }

        await this.avatarsRepository.softDelete(avatar.id);

        await this.fileService.removeFile({
            path: `${this.storageAvatarsFolder}/${name}`,
        });
        this.logger.log(`Remove avatar success userId=${id} filename=${name}`);
    }

    async findMostActive(from: User['age'], to: User['age']) {
        this.logger.log(
            `Find most active users attempt ageFrom=${from} ageTo=${to}`,
        );
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

        this.logger.log(
            `Find most active users success ageFrom=${from} ageTo=${to} count=${users.length}`,
        );

        return users;
    }

    @Transactional()
    async sendMoney(source: User['id'], target: User['id'], amount: number) {
        this.logger.log(
            `Send money attempt sourceUserId=${source} targetUserId=${target} amount=${amount}`,
        );
        const sourceUser = (await this.usersRepository.findOne({
            where: {
                id: source,
            },
        })) as User;

        const sourceNewBalance = Number(sourceUser.balance) - amount;
        sourceUser.balance = String(sourceNewBalance);

        try {
            await this.usersRepository.save(sourceUser);
        } catch (e) {
            this.logger.error(
                `Send money failed sourceUserId=${source} targetUserId=${target}: ${
                    e instanceof Error ? e.message : e
                }`,
            );
            throw new InternalServerErrorException('Failed to withdraw funds');
        }
        const targetUser = await this.usersRepository.findOne({
            where: {
                id: target,
            },
        });
        if (!targetUser) {
            this.logger.warn(
                `Send money failed sourceUserId=${source} targetUserId=${target}: target user not found`,
            );
            throw new BadRequestException('Target user not found');
        }

        const targetNewBalance = Number(targetUser.balance) + amount;
        targetUser.balance = String(targetNewBalance);

        await this.usersRepository.save(targetUser);
        this.logger.log(
            `Send money success sourceUserId=${source} targetUserId=${target} amount=${amount}`,
        );
    }

    async getBalance(id: User['id']) {
        this.logger.log(`Get balance attempt userId=${id}`);
        return await this._findOne({ id }, { select: ['balance'] });
    }
}
