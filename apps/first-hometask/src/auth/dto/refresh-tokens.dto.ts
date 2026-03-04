import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RefreshTokensSchema = z
    .object({
        refreshToken: z.string(),
    })
    .required();

export class RefreshTokensDto extends createZodDto(RefreshTokensSchema) {}
