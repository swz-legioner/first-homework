import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const BalanceResetSchema = z.object({
    created: z.boolean(),
});

export class BalanceResetDto extends createZodDto(BalanceResetSchema) {}
