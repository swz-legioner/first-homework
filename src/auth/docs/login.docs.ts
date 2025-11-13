import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignInUserDto } from '../dto/sign-in-user.dto';
import { TokensDto } from '../dto/tokens.dto';

export const LoginDocs = () =>
    applyDecorators(
        ApiOperation({ summary: 'Authorization under the specified user' }),
        ApiBody({ type: SignInUserDto }),
        ApiResponse({ status: 200, type: TokensDto }),
        ApiResponse({ status: 404, description: 'User not found' }),
        ApiResponse({ status: 401, description: 'Invalid password' }),
    );
