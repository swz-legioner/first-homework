import { applyDecorators } from '@nestjs/common';
import {
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';

export const AddAvatarDocs = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Upload an avatar for the current user',
        }),
        ApiConsumes('multipart/form-data'),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    avatar: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                required: ['avatar'],
            },
        }),
        ApiResponse({
            status: 201,
            description: 'Avatar uploaded successfully',
        }),
        ApiResponse({
            status: 400,
            description: 'Invalid file or avatar limit reached',
        }),
        ApiResponse({
            status: 500,
            description: 'Failed to upload avatar',
        }),
    );
