import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { Event, EventSchema } from '../events/event.schema';
import { NotificationController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { EventRepository } from '../events/event.repository';

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    ],
    providers: [EventRepository, NotificationsGateway, NotificationsService],
    controllers: [NotificationController],
})
export class NotificationsModule {}
