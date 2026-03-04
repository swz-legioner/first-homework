import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SignUpUserSchema = z
    .object({
        username: z.string().min(4).max(32).trim(),
        email: z.email().trim(),
        password: z.string().min(8).max(32).trim(),
        age: z.number().min(1).max(130),
        description: z.string().min(1).max(1000).trim(),
    })
    .required();

export class SignUpUserDto extends createZodDto(SignUpUserSchema) {}
