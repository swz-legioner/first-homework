import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const DeleteAvatarDocs = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Delete an avatar by filename for the current user',
        }),
        ApiResponse({
            status: 200,
            description: 'Avatar deleted (no-op if not found)',
        }),
        ApiResponse({
            status: 400,
            description: 'Invalid filename',
        }),
        ApiResponse({
            status: 500,
            description: 'Failed to delete avatar',
        }),
    );
