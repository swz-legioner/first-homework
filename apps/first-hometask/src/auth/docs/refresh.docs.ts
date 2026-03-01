import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RefreshTokensDto } from '../dto/refresh-tokens.dto';
import { TokensDto } from '../dto/tokens.dto';

export const RefreshDocs = () =>
    applyDecorators(
        ApiOperation({ summary: 'Updating the access token (and refresh)' }),
        ApiBody({ type: RefreshTokensDto }),
        ApiResponse({ status: 200, type: TokensDto }),
        ApiResponse({
            status: 400,
            description: 'Bad token/Bad token kind',
        }),
    );
