import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema()
export class Event {
    @Prop()
    from: string;

    @Prop()
    to: string;

    @Prop()
    amount: number;

    @Prop()
    timestamp: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);
