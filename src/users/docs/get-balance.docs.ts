import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetBalanceDto } from '../dto/get-balance.dto';

export const GetBalanceDocs = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Get current user balance',
        }),
        ApiResponse({ status: 200, type: GetBalanceDto }),
    );
