import { MoneySentEvent, MoneySentEventName } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '../events/event.repository';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private readonly eventRepository: EventRepository) {}

    public async createAndSaveBalanceEvent(data: MoneySentEvent) {
        const message = {
            event: MoneySentEventName,
            from: data.from,
            to: data.to,
            amount: data.amount,
            timestamp: data.timestamp,
        };

        this.logger.log(
            `Sending to user=${data.to} message=${JSON.stringify(data)}`,
        );

        await this.eventRepository.insertOne(data);

        return {
            to: data.to,
            message,
        };
    }
}
