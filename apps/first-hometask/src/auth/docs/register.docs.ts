import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignUpUserDto } from '../dto/sign-up-user.dto';
import { TokensDto } from '../dto/tokens.dto';

export const RegisterDocs = () =>
    applyDecorators(
        ApiOperation({ summary: 'User registration' }),
        ApiBody({ type: SignUpUserDto }),
        ApiResponse({ status: 200, type: TokensDto }),
        ApiResponse({
            status: 400,
            description: 'User with same email or name already exists',
        }),
    );
