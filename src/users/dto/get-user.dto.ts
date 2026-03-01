import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetUserSchema = z
    .object({
        id: z.uuidv4(),
        username: z.string().min(4).max(32),
        email: z.email(),
        age: z.number().min(1).max(130),
        description: z.string().min(1).max(1000),
    })
    .required();

export class GetUserDto extends createZodDto(GetUserSchema) {}
