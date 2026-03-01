import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RemoveAvatarQuerySchema = z.object({
    name: z.string().min(1),
});

export class RemoveAvatarQueryDto extends createZodDto(
    RemoveAvatarQuerySchema,
) {}
