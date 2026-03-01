import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const DeleteUserDocs = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Deletes your profile',
        }),
        ApiResponse({ status: 200, description: 'User successfully deleted' }),
        ApiResponse({
            status: 400,
            description: 'User not found or already deleted',
        }),
        ApiResponse({
            status: 500,
            description: 'Failed attempt to delete/Unhandled',
        }),
    );
