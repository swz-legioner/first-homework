import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';

import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

import { Avatar } from './users/avatars.entity';

import { S3Module } from './providers/files/s3/s3.module';

import appConfig from './config/app.config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis, { Keyv } from '@keyv/redis';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig],
            envFilePath:
                process.env.NODE_ENV === 'production'
                    ? ['.env']
                    : [`.env.${process.env.NODE_ENV}.local`, '.env'],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [appConfig.KEY],
            useFactory: (config: ConfigType<typeof appConfig>) => {
                return {
                    ...config.db,
                    entities: [User, Avatar],
                };
            },
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            inject: [appConfig.KEY],
            useFactory: (config: ConfigType<typeof appConfig>) => {
                const password = config.redis.password;
                const connection = `redis://${password ? ':' + password : ''}@localhost:${config.redis.port}`;
                return {
                    ttl: 30 * 1000,
                    stores: [
                        new Keyv({
                            store: new KeyvRedis(connection),
                        }),
                    ],
                };
            },
        }),
        UsersModule,
        AuthModule,
        S3Module,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
