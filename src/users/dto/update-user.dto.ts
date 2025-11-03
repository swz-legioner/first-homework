import { createZodDto } from 'nestjs-zod';
import { SignUpUserSchema } from 'src/auth/dto/sign-up-user.dto';

export const UpdateUserSchema = SignUpUserSchema.partial();

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
