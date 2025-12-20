import * as AWS from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';

import { S3Lib } from './constants/do-spaces-service-lib.constant';
import { S3Service } from './s3.service';

import appConfig from '../../../config/app.config';
import { ConfigModule, ConfigType } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [
        S3Service,
        {
            provide: S3Lib,
            inject: [appConfig.KEY],
            useFactory: (config: ConfigType<typeof appConfig>) => {
                return new AWS.S3({
                    endpoint: `http://${config.minio.host}:${config.minio.port}`,
                    region: 'ru-central1',
                    credentials: {
                        accessKeyId: config.minio.access,
                        secretAccessKey: config.minio.secret,
                    },
                });
            },
        },
    ],
    exports: [S3Service, S3Lib],
})
export class S3Module {}
