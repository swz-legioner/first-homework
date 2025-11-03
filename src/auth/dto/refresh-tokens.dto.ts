import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RefreshTokensSchema = z
    .object({
        accessToken: z.string(),
    })
    .required();

export class RefreshTokensDto extends createZodDto(RefreshTokensSchema) {}
