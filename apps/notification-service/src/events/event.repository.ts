import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './event.schema';
import { MoneySentEvent } from '@app/common';

@Injectable()
export class EventRepository {
    constructor(@InjectModel(Event.name) private model: Model<Event>) {}

    async insertOne(data: MoneySentEvent) {
        return await this.model.insertOne(data);
    }
}
