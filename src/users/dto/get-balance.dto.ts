import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetBalanceSchema = z
    .object({
        balance: z.string(),
    })
    .required();

export class GetBalanceDto extends createZodDto(GetBalanceSchema) {}
