import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendMoneyDto } from '../dto/send-money.dto';

export const SendMoneyDocs = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Sends `amount` of money to the user with id = `target`',
        }),
        ApiBody({ type: SendMoneyDto }),
        ApiResponse({
            status: 200,
            description: 'Funds transferred successfully',
        }),
        ApiResponse({
            status: 400,
            description: 'Target user not found',
        }),
        ApiResponse({
            status: 500,
            description: 'Failed to withdraw funds from the current user',
        }),
    );
