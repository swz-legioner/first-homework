import KeyvRedis, { Keyv } from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { AuthModule } from './auth/auth.module';

import { Avatar } from './users/avatars.entity';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

import { S3Module } from './providers/files/s3/s3.module';

import { BalanceResetModule } from './balance-reset/balance-reset.module';

import { NotificationService } from '@app/common';

import appConfig from './config/app.config';

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
        ClientsModule.registerAsync({
            isGlobal: true,
            clients: [
                {
                    imports: [ConfigModule],
                    inject: [appConfig.KEY],
                    name: NotificationService.NAME,
                    useFactory: (config: ConfigType<typeof appConfig>) => {
                        return {
                            transport: Transport.KAFKA,
                            options: {
                                client: {
                                    clientId: NotificationService.CLIENT_ID,
                                    brokers: [
                                        `${config.kafka.url}:${config.kafka.first_port}`,
                                    ],
                                },
                                consumer: {
                                    groupId: NotificationService.GROUP_ID,
                                },
                            },
                        };
                    },
                },
            ],
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
