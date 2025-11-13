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

import { extractUserPayload } from '../utils/extractUserPayload';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) {
            return true;
        }

        const request: Request = context.switchToHttp().getRequest();

        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const maybePayload: unknown = await this.jwtService.verifyAsync(
                token,
                {
                    secret: this.configService.get<string>('JWT_SECRET'),
                },
            );
            const payload = extractUserPayload(maybePayload);

            if (payload === null) {
                throw new Error('Payload not found in token');
            }
            if (payload.kind === 'refresh') {
                throw new Error('Invalid token kind used');
            }
            request['user'] = payload;
        } catch (e) {
            throw new UnauthorizedException(`Invalid credentials: ${e}`);
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
