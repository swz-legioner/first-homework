import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetMostActiveUsersQuerySchema = z.object({
    ageFrom: z.number().min(1).max(130).default(1),
    ageTo: z.number().min(1).max(130).default(130),
});

export class GetMostActiveUsersQueryDto extends createZodDto(
    GetMostActiveUsersQuerySchema,
) {}
