import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetMostActiveUsersDto } from '../dto/get-most-active-users.dto';

export const GetMostActiveUsersDocs = () =>
    applyDecorators(
        ApiOperation({
            summary:
                'Get users with 2+ avatars and a non-empty description within an age range',
        }),
        ApiResponse({
            status: 200,
            type: GetMostActiveUsersDto,
            description: 'Users fetched successfully',
        }),
        ApiResponse({
            status: 400,
            description: 'Invalid age range',
        }),
        ApiResponse({
            status: 500,
            description: 'Failed to fetch users',
        }),
    );
