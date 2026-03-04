import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { GetUserSchema } from './get-user.dto';

export const GetUsersSchema = z
    .object({
        users: z.array(GetUserSchema),
        maxPage: z.number().min(1),
    })
    .required();

export class GetUsersDto extends createZodDto(GetUsersSchema) {}
