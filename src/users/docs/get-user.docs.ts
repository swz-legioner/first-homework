import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GetUserDto } from '../dto/get-user.dto';

export const GetUserDocs = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Get user profile with a specified ID',
        }),
        ApiParam({
            name: 'id',
        }),
        ApiResponse({ status: 200, type: GetUserDto }),
        ApiResponse({
            status: 400,
            description: 'Incorrect userId',
        }),
        ApiResponse({
            status: 404,
            description: 'User with id/username not found',
        }),
    );
