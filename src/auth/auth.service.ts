import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import bcrypt from 'bcrypt';

import { SignInUserDto } from './dto/sign-in-user.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { SignUpUserDto } from './dto/sign-up-user.dto';
import { TokensDto } from './dto/tokens.dto';

import { UserNotFoundError } from 'src/errors/UserNotFound';
import { InvalidTokenError } from './errors/invalid-token';
import { InvalidTokenKindError } from './errors/invalid-token-kind';
import { PasswordInvalidError } from './errors/password-invalid';
import { UserAlreadyExistsError } from './errors/user-already-exists';
import { UserNotCreatedError } from './errors/user-not-created';

import { JWT_SECRET } from 'src/const/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { extractUserPayload } from 'src/utils/extractUserPayload';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
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
        const foundUser = await this.usersService.findByName(
            user.username,
            false,
        );
        if (foundUser === null) {
            throw new UserNotFoundError();
        }

        const passwordCorrect = await bcrypt.compare(
            user.password,
            foundUser.password,
        );
        if (!passwordCorrect) {
            throw new PasswordInvalidError();
        }

        const payload = {
            id: foundUser.id,
            name: foundUser.username,
        };

        return this.createTokens(payload);
    }

    async signUp(user: SignUpUserDto) {
        const sameEmail = await this.usersService.findByEmail(user.email);
        if (sameEmail) {
            throw new UserAlreadyExistsError();
        }

        const sameName = await this.usersService.findByName(user.username);
        if (sameName) {
            throw new UserAlreadyExistsError();
        }

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(user.password, salt);
        let id: User['id'];

        try {
            id = await this.usersService.createOne({
                ...user,
                password: hash,
            });
        } catch (e) {
            throw new UserNotCreatedError(
                e instanceof Error ? e.message : JSON.stringify(e),
            );
        }

        const payload = {
            id,
            name: user.username,
        };

        return this.createTokens(payload);
    }

    async refreshTokens({ accessToken }: RefreshTokensDto) {
        let maybePayload: unknown;
        try {
            maybePayload = await this.jwtService.verifyAsync(accessToken, {
                secret: JWT_SECRET,
            });
        } catch (e) {
            throw new InvalidTokenError((e as Error).message ?? e);
        }

        const payload = extractUserPayload(maybePayload);
        if (payload === null) {
            throw new InvalidTokenError();
        }
        if (payload.kind === 'access') {
            throw new InvalidTokenKindError();
        }

        return this.createTokens({ name: payload?.name, id: payload?.id });
    }
}
