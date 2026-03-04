import { extractTokenFromHeader, extractUserPayload } from '@app/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async verify(header?: string) {
        const token = extractTokenFromHeader(header);
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
            throw new UnauthorizedException(`Invalsid kind of token`);
        }
        return payload;
    }
}
