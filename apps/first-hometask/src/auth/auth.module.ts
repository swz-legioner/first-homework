import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

import { UsersModule } from '../users/users.module';

import appConfig from '../config/app.config';

@Module({
    imports: [
        UsersModule,
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
    controllers: [AuthController],
    providers: [
        AuthService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class AuthModule {}
