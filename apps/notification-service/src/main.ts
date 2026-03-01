import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
    const app = await NestFactory.create(NotificationServiceModule);
    const port = process.env.port ?? 3001;
    await app.listen(port);

    return { port };
}
bootstrap()
    .then(({ port }) => {
        console.log('Server started at', port);
    })
    .catch((e) => {
        console.log('Server failed with error: ', e);
    });
