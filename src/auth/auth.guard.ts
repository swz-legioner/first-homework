import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '../common/decorators/is-public';

import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { extractUserPayload } from '../utils/extractUserPayload';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private configService: ConfigService,
        private usersService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.isPublicKey(context)) {
            return true;
        }

        const request: Request = context.switchToHttp().getRequest();

        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }

        const maybePayload: unknown = await this.jwtService.verifyAsync(token, {
            secret: this.configService.get<string>('JWT_SECRET'),
        });

        const payload = extractUserPayload(maybePayload);
        if (payload === null) {
            throw new UnauthorizedException(`Empty payload`);
        }
        if (payload.kind === 'refresh') {
            throw new UnauthorizedException(`Invalid kind of token`);
        }

        const userExists = await this.isUserExists(payload.id);
        if (!userExists) {
            throw new UnauthorizedException('User not found');
        }

        request['user'] = payload;

        return true;
    }

    private async isUserExists(id: User['id']): Promise<boolean> {
        const user = await this.usersService.findOne({ id });
        return user !== null;
    }

    private isPublicKey(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        return isPublic;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
