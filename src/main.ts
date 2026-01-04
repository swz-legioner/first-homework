import { ConfigService, ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { AppModule } from './app.module';
import appConfig from './config/app.config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    const configService = app.get(ConfigService);
    const { http } = configService.get('app') as ConfigType<typeof appConfig>;

    const config = new DocumentBuilder()
        .setTitle('Homework API')
        .setVersion('1.0')
        .addTag('homework')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                in: 'header',
                name: 'JWT',
                description: 'Enter your Bearer token',
            },
            'Authorization',
        )
        .addGlobalResponse({
            status: 500,
            description: 'Internal server error',
        })
        .addGlobalResponse({
            status: 401,
            description: 'Unauthorized',
        })
        .addGlobalResponse({
            status: 400,
            description: 'Bad request',
        })
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory, {
        jsonDocumentUrl: 'api/json',
    });

    await app.listen(http.port);
}

bootstrap()
    .then(() => {
        console.log('Server started');
    })
    .catch((e) => {
        console.log('Server failed with error: ', e);
    });
