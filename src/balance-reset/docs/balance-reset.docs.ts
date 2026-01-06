import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BalanceResetDto } from '../dto/balance-reset.dto';

export const StartResetJobDocs = () =>
    applyDecorators(
        ApiOperation({ summary: 'Starts the job to reset all user balances' }),
        ApiResponse({
            status: 201,
            type: BalanceResetDto,
            description: 'Job created successfully',
        }),
    );
