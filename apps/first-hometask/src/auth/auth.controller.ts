import { Body, Controller, Post, UsePipes } from '@nestjs/common';

import { AuthService } from './auth.service';

import {
    RefreshTokensDto,
    RefreshTokensSchema,
} from './dto/refresh-tokens.dto';
import { SignInUserDto, SignInUserSchema } from './dto/sign-in-user.dto';
import { SignUpUserDto, SignUpUserSchema } from './dto/sign-up-user.dto';
import { TokensDto } from './dto/tokens.dto';

import { Public } from '@app/common';
import { ZodValidationPipe } from '@app/common';
import { LoginDocs } from './docs/login.docs';
import { RegisterDocs } from './docs/register.docs';
import { RefreshDocs } from './docs/refresh.docs';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('login')
    @LoginDocs()
    @UsePipes(new ZodValidationPipe(SignInUserSchema))
    async signIn(@Body() user: SignInUserDto): Promise<TokensDto> {
        return await this.authService.signIn(user);
    }

    @Public()
    @Post('register')
    @RegisterDocs()
    @UsePipes(new ZodValidationPipe(SignUpUserSchema))
    async signUp(@Body() user: SignUpUserDto): Promise<TokensDto> {
        return await this.authService.signUp(user);
    }

    @Public()
    @Post('refresh')
    @RefreshDocs()
    @UsePipes(new ZodValidationPipe(RefreshTokensSchema))
    async refresh(@Body() body: RefreshTokensDto): Promise<TokensDto> {
        return await this.authService.refreshTokens(body);
    }
}
