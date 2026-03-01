import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';

import appConfig from '../config/app.config';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [appConfig.KEY],
            useFactory: (config: ConfigType<typeof appConfig>) => {
                return {
                    global: true,
                    secret: config.jwt.secret,
                    signOptions: { expiresIn: '60s' },
                };
            },
        }),
    ],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
