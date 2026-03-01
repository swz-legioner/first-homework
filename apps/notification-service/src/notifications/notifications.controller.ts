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
            body.userId,
            body.message,
        );
    }

    @EventPattern(MoneySentEventName)
    async handleMoneySent(data: MoneySentEvent) {
        await this.notificationGateway.sendBalanceNotification(
            data.from,
            data.to,
            data.amount,
            data.timestamp,
        );
    }
}
