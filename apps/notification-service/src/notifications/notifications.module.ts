import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { NotificationController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { Event, EventSchema } from '../schemas/event-schema';

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    ],
    providers: [NotificationsGateway],
    controllers: [NotificationController],
})
export class NotificationsModule {}
