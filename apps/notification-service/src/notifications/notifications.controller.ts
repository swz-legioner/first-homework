import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import {
    SendNotificationDto,
    SendNotificationSchema,
} from './dto/send-notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { EventPattern } from '@nestjs/microservices';
import { MoneySentEvent, MoneySentEventName } from '@app/common';

@Controller('notification')
export class NotificationController {
    constructor(private notificationGateway: NotificationsGateway) {}

    @Post()
    sendNotification(
        @Body(new ZodValidationPipe(SendNotificationSchema))
        body: SendNotificationDto,
    ) {
        return this.notificationGateway.sendNotification(
            'message',
            body.userId,
            body.message,
        );
    }

    @EventPattern(MoneySentEventName)
    handleMoneySent(data: MoneySentEvent) {
        this.notificationGateway.sendNotification(
            'notification',
            data.to,
            `User ${data.from} sent you ${data.amount} money`,
        );
    }
}
