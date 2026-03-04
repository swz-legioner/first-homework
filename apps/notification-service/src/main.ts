import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { NotificationServiceModule } from './notification-service.module';

import { AppConfig, NotificationService } from '@app/common';

async function bootstrap() {
    const app = await NestFactory.create(NotificationServiceModule);

    const config: AppConfig | undefined = app.get(ConfigService).get('app');
    const port = config?.http.notifications_port ?? 3001;

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: [`${config?.kafka.url}:${config?.kafka.first_port}`],
            },
            consumer: {
                groupId: NotificationService.GROUP_ID,
            },
        },
    });

    await app.startAllMicroservices();

    await app.listen(port);
}
bootstrap()
    .then(() => {
        console.log('Server started');
    })
    .catch((e) => {
        console.log('Server failed with error: ', e);
    });
