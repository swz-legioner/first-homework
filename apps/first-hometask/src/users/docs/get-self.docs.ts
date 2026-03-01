import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUserDto } from '../dto/get-user.dto';

export const GetSelfDocs = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Get self profile',
            description:
                'Returns profile data for the currently authenticated user.',
        }),
        ApiResponse({ status: 200, type: GetUserDto }),
        ApiResponse({
            status: 404,
            description: 'User with id/username not found',
        }),
    );
