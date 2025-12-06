import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUsersDto } from '../dto/get-users.dto';

export const GetUsersDocs = () =>
    applyDecorators(
        ApiOperation({
            summary: 'List of users with a (partial) filter match in username',
        }),
        ApiResponse({ status: 200, type: GetUsersDto }),
        ApiResponse({
            status: 400,
            description: 'Attempt to request a non-existent page',
        }),
    );
