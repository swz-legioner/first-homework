import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { AuthModule } from './auth/auth.module';

import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

import { Avatar } from './users/avatars.entity';

import { S3Module } from './providers/files/s3/s3.module';

import appConfig from './config/app.config';
import { DataSource } from 'typeorm';
import { BalanceResetModule } from './balance-reset/balance-reset.module';

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
            // eslint-disable-next-line @typescript-eslint/require-await
            async dataSourceFactory(options) {
                if (!options) {
                    throw new Error('Invalid options passed');
                }

                return addTransactionalDataSource(new DataSource(options));
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
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [appConfig.KEY],
            useFactory: (config: ConfigType<typeof appConfig>) => {
                return {
                    connection: {
                        host: 'localhost',
                        port: Number(config.redis.port),
                        password: config.redis.password,
                    },
                };
            },
        }),
        UsersModule,
        AuthModule,
        S3Module,
        BalanceResetModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
