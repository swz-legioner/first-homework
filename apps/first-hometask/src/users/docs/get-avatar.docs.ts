import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetAvatarsDto } from '../dto/get-avatars.dto';

export const GetAvatarDocs = () =>
    applyDecorators(
        ApiOperation({
            summary: "Get the current user's avatars",
        }),
        ApiResponse({
            status: 200,
            type: GetAvatarsDto,
            description: 'Avatars fetched successfully',
        }),
    );
