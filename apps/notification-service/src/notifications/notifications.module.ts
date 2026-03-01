import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { AuthModule } from '../auth/auth.module';
import { NotificationController } from './notifications.controller';

@Module({
    imports: [AuthModule],
    providers: [NotificationsGateway],
    controllers: [NotificationController],
})
export class NotificationsModule {}
