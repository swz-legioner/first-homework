import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
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
import { extractUserPayload } from '../utils/extractUserPayload';

@Injectable()
export class AuthService {
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
            throw new BadRequestException('Invalid password');
        }

        const payload = {
            id: foundUser.id,
            name: foundUser.username,
        };

        return this.createTokens(payload);
    }

    async signUp(user: SignUpUserDto) {
        const sameEmail = await this.usersService.findOne({
            email: user.email,
        });
        if (sameEmail) {
            throw new BadRequestException(
                'User with same email already exists',
            );
        }

        const sameName = await this.usersService.findOne({
            username: user.username,
        });
        if (sameName) {
            throw new BadRequestException('User with same name already exists');
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
            throw new InternalServerErrorException(
                'Failed attempt to create user: ' + (e as Error).message,
            );
        }

        const payload = {
            id,
            name: user.username,
        };

        return this.createTokens(payload);
    }

    async refreshTokens({ refreshToken }: RefreshTokensDto) {
        const maybePayload = (await this.jwtService.verifyAsync(refreshToken, {
            secret: this.configService.get<string>('JWT_SECRET'),
        })) as unknown;

        const payload = extractUserPayload(maybePayload);
        if (payload === null) {
            throw new BadRequestException('Invalid token payload');
        }
        if (payload.kind === 'access') {
            throw new BadRequestException('Invalid kind of token');
        }

        return this.createTokens({ name: payload?.name, id: payload?.id });
    }
}
