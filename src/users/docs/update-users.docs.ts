import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from '../dto/update-user.dto';

export const UpdateUserDocs = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Updates your profile with data from the request',
        }),
        ApiBody({ type: UpdateUserDto }),
        ApiResponse({ status: 200, description: 'User successfully updated' }),
        ApiResponse({
            status: 404,
            description: 'User not found',
        }),
        ApiResponse({
            status: 400,
            description: 'Nothing to update',
        }),
        ApiResponse({
            status: 500,
            description: 'Failed attempt to update/Unhandled',
        }),
    );
