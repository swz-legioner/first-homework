import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const TokensSchema = z
    .object({
        accessToken: z.string(),
        refreshToken: z.string(),
    })
    .required();

export class TokensDto extends createZodDto(TokensSchema) {}
