import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationServiceModule } from './notification-service.module';

import { NotificationService } from '@app/common';

import getConfig from './config/app.config';

async function bootstrap() {
    const config = getConfig();

    const app = await NestFactory.create(NotificationServiceModule);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: [`localhost:${config.kafka.first_port}`],
            },
            consumer: {
                groupId: NotificationService.GROUP_ID,
            },
        },
    });

    await app.startAllMicroservices();

    await app.listen(config.http.notifications_port);
}
bootstrap()
    .then(() => {
        console.log('Server started');
    })
    .catch((e) => {
        console.log('Server failed with error: ', e);
    });
