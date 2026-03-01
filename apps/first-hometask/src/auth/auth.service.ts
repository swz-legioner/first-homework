import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import bcrypt from 'bcrypt';

import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { SignInUserDto } from './dto/sign-in-user.dto';
import { SignUpUserDto } from './dto/sign-up-user.dto';
import { TokensDto } from './dto/tokens.dto';

import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { extractUserPayload } from '@app/common';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    private async createTokens<T extends object>(
        payload: T,
    ): Promise<TokensDto> {
        return {
            accessToken: await this.jwtService.signAsync(
                { ...payload, kind: 'access' },
                {
                    expiresIn: '15m',
                },
            ),
            refreshToken: await this.jwtService.signAsync(
                { ...payload, kind: 'refresh' },
                {
                    expiresIn: '15d',
                },
            ),
        };
    }

    async signIn(user: SignInUserDto): Promise<TokensDto> {
        this.logger.log(`Sign-in attempt username=${user.username}`);
        const foundUser = await this.usersService.findOneStrict(
            {
                username: user.username,
            },
            false,
        );

        const passwordCorrect = await bcrypt.compare(
            user.password,
            foundUser.password,
        );
        if (!passwordCorrect) {
            this.logger.warn(
                `Sign-in failed username=${user.username}: invalid credentials`,
            );
            throw new BadRequestException('Invalid credentials');
        }

        const payload = {
            id: foundUser.id,
            name: foundUser.username,
        };

        this.logger.log(`Sign-in success userId=${foundUser.id}`);

        return this.createTokens(payload);
    }

    async signUp(user: SignUpUserDto) {
        this.logger.log(
            `Sign-up attempt username=${user.username} email=${user.email}`,
        );
        const sameEmail = await this.usersService.findOne({
            email: user.email,
        });
        if (sameEmail) {
            this.logger.warn(
                `Sign-up failed username=${user.username} email=${user.email}: email already registered`,
            );
            throw new BadRequestException('Invalid credentials');
        }

        const sameName = await this.usersService.findOne({
            username: user.username,
        });
        if (sameName) {
            this.logger.warn(
                `Sign-up failed username=${user.username}: username already registered`,
            );
            throw new BadRequestException('Invalid credentials');
        }

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(user.password, salt);
        let id: User['id'];

        try {
            id = await this.usersService.insertOne({
                ...user,
                password: hash,
            });
        } catch (e) {
            this.logger.error(
                `Sign-up failed username=${user.username} email=${user.email}: ` +
                    (e as Error).message,
            );
            throw new InternalServerErrorException(
                'Failed attempt to create user',
            );
        }

        const payload = {
            id,
            name: user.username,
        };

        this.logger.log(`Sign-up success userId=${id}`);

        return this.createTokens(payload);
    }

    async refreshTokens({ refreshToken }: RefreshTokensDto) {
        this.logger.log('Token refresh attempt');
        const maybePayload = (await this.jwtService.verifyAsync(refreshToken, {
            secret: this.configService.get<string>('JWT_SECRET'),
        })) as unknown;

        const payload = extractUserPayload(maybePayload);
        if (payload === null) {
            this.logger.warn('Token refresh failed: invalid token payload');
            throw new BadRequestException('Invalid token payload');
        }
        if (payload.kind === 'access') {
            this.logger.warn(
                `Token refresh failed userId=${payload.id}: invalid token kind`,
            );
            throw new BadRequestException('Invalid kind of token');
        }

        this.logger.log(
            `Token refresh success userId=${payload.id} username=${payload.name}`,
        );

        return this.createTokens({ name: payload?.name, id: payload?.id });
    }
}
