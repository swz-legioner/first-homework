import {
    BadRequestException,
    Body,
    Controller,
    InternalServerErrorException,
    NotFoundException,
    Post,
    UnauthorizedException,
    UsePipes,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import {
    RefreshTokensDto,
    RefreshTokensSchema,
} from './dto/refresh-tokens.dto';
import { SignInUserDto, SignInUserSchema } from './dto/sign-in-user.dto';
import { SignUpUserDto, SignUpUserSchema } from './dto/sign-up-user.dto';
import { TokensDto } from './dto/tokens.dto';

import { UserNotFoundError } from 'src/errors/UserNotFound';
import { InvalidTokenError } from './errors/invalid-token';
import { InvalidTokenKindError } from './errors/invalid-token-kind';
import { PasswordInvalidError } from './errors/password-invalid';
import { UserAlreadyExistsError } from './errors/user-already-exists';

import { Public } from 'src/common/decorators/is-public';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Authorization under the specified user' })
    @ApiBody({ type: SignInUserDto })
    @ApiResponse({ status: 200, type: TokensDto })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Invalid password' })
    @UsePipes(new ZodValidationPipe(SignInUserSchema))
    async signIn(@Body() user: SignInUserDto): Promise<TokensDto> {
        try {
            return await this.authService.signIn(user);
        } catch (e) {
            if (e instanceof UserNotFoundError) {
                throw new NotFoundException(
                    `User with name=${user.username} not found`,
                );
            }
            if (e instanceof PasswordInvalidError) {
                throw new UnauthorizedException(`Invalid password`);
            }

            throw new InternalServerErrorException('Unhandled error');
        }
    }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'User registration' })
    @ApiBody({ type: SignUpUserDto })
    @ApiResponse({ status: 200, type: TokensDto })
    @ApiResponse({
        status: 400,
        description: 'User with same email or name already exists',
    })
    @UsePipes(new ZodValidationPipe(SignUpUserSchema))
    async signUp(@Body() user: SignUpUserDto): Promise<TokensDto> {
        try {
            return await this.authService.signUp(user);
        } catch (e) {
            if (e instanceof UserAlreadyExistsError) {
                throw new BadRequestException(
                    'User with same email or name already exists',
                );
            }

            throw new InternalServerErrorException('Unhandled Error');
        }
    }

    @Public()
    @Post('refresh')
    @ApiOperation({ summary: 'Updating the access token (and refresh)' })
    @ApiBody({ type: RefreshTokensDto })
    @ApiResponse({ status: 200, type: TokensDto })
    @ApiResponse({
        status: 400,
        description: 'Bad token/Bad token kind',
    })
    @UsePipes(new ZodValidationPipe(RefreshTokensSchema))
    async refresh(@Body() body: RefreshTokensDto): Promise<TokensDto> {
        try {
            return await this.authService.refreshTokens(body);
        } catch (e) {
            if (e instanceof InvalidTokenError) {
                throw new BadRequestException(e.message ?? 'Bad token');
            }

            if (e instanceof InvalidTokenKindError) {
                throw new BadRequestException(e.message ?? 'Bad token kind');
            }

            throw new InternalServerErrorException('Unhandled Error');
        }
    }
}
