import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { GetUserSchema } from './get-user.dto';

export const GetMostActiveUsersQuerySchema = z.object({
    ageFrom: z.number().min(1).max(130).default(1),
    ageTo: z.number().min(1).max(130).default(130),
});

export class GetMostActiveUsersQueryDto extends createZodDto(
    GetMostActiveUsersQuerySchema,
) {}

export const GetMostActiveUsersSchema = z.array(
    GetUserSchema.omit({ id: true }).extend({ lastAvatar: z.string() }),
);

export class GetMostActiveUsersDto extends createZodDto(
    GetMostActiveUsersSchema,
) {}
