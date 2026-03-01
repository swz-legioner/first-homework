import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SendMoneySchema = z.object({
    target: z.uuidv4(),
    amount: z.number().min(0.01),
});

export class SendMoneyDto extends createZodDto(SendMoneySchema) {}
