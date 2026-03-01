import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { DefaultEventsMap, Server, Socket } from 'socket.io';

import { AuthService } from '../auth/auth.service';
import { Event } from '../schemas/event-schema';
import { MoneySentEventName } from '@app/common';

@WebSocketGateway()
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger(NotificationsGateway.name);
    @WebSocketServer() io: Server;

    constructor(
        private authService: AuthService,
        @InjectModel(Event.name) private eventModel: Model<Event>,
    ) {}

    afterInit() {
        this.logger.log('NotificationsGateway Initialized');
    }

    async handleConnection(
        client: Socket<
            DefaultEventsMap,
            DefaultEventsMap,
            DefaultEventsMap,
            { id: string; username: string }
        >,
    ) {
        const authorization = client.handshake.headers.authorization;
        try {
            const user = await this.authService.verify(authorization);
            client.data.id = user.id;
            client.data.username = user.name;
        } catch {
            client.disconnect();
            return;
        }
        const { sockets } = this.io.sockets;

        await client.join(client.data.id);

        this.logger.log(
            `[${client.data.id}](${client.data.username}) connected`,
        );
        this.logger.debug(`Number of connected clients: ${sockets.size}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client id:${client.id} disconnected`);
    }

    @SubscribeMessage('message')
    handleMessage(client: Socket, data: any) {
        this.logger.log(`Message received from client id: ${client.id}`);
        this.logger.debug(`Payload: ${data}`);
        return {
            event: 'message',
            data:
                data === 'ping'
                    ? 'pong'
                    : data === 'pong'
                      ? 'ping'
                      : 'or ping or pong',
        };
    }

    sendNotification(to: string, message: string) {
        this.logger.log(`Sending to user=${to} message=${message}`);
        return this.io.to(to).emit('notification', message);
    }

    async sendBalanceNotification(
        from: string,
        to: string,
        amount: number,
        timestamp: number,
    ) {
        const data = {
            event: MoneySentEventName,
            from,
            to,
            amount,
            timestamp,
        };

        this.logger.log(
            `Sending to user=${to} message=${JSON.stringify(data)}`,
        );

        const createdEvent = new this.eventModel({
            from,
            to,
            amount,
            timestamp,
        });

        await createdEvent.save();

        return this.io.to(to).emit('notification', data);
    }
}
