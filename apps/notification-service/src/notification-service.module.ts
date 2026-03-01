import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';

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
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [appConfig.KEY],
            useFactory: (config: ConfigType<typeof appConfig>) => {
                return {
                    uri: `mongodb://${config.mongo.user}:${config.mongo.password}@localhost:${config.mongo.port}`,
                    dbName: 'homework',
                };
            },
        }),
        NotificationsModule,
        AuthModule,
    ],
})
export class NotificationServiceModule {}
