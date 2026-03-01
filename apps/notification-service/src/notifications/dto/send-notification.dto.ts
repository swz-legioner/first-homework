import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SendNotificationSchema = z.object({
    userId: z.string(),
});

export class SendNotificationDto extends createZodDto(SendNotificationSchema) {}
