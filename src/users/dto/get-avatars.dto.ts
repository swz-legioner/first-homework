import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetAvatarsSchema = z.array(
    z
        .object({
            name: z.string(),
            created: z.iso.date(),
        })
        .required(),
);

export class GetAvatarsDto extends createZodDto(GetAvatarsSchema) {}
