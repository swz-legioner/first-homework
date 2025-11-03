import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SignInUserSchema = z
    .object({
        username: z.string().min(4).max(32).trim(),
        password: z.string().min(8).max(32).trim(),
    })
    .required();

export class SignInUserDto extends createZodDto(SignInUserSchema) {}
