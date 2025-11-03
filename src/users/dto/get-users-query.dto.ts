import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetUsersQuerySchema = z.object({
    filter: z.string().optional(),
    page: z
        .string()
        .transform((e) => Number(e))
        .optional(),
});

export class GetUsersQueryDto extends createZodDto(GetUsersQuerySchema) {}
