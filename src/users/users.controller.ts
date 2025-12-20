import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';

import { User } from './user.decorator';
import { UsersService } from './users.service';

import { GetUserDto } from './dto/get-user.dto';
import {
    GetUsersQueryDto,
    GetUsersQuerySchema,
} from './dto/get-users-query.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto, UpdateUserSchema } from './dto/update-user.dto';

import {
    RemoveAvatarQueryDto,
    RemoveAvatarQuerySchema,
} from './dto/delete-avatar.dto';
import { GetAvatarsDto } from './dto/get-avatars.dto';
import {
    GetMostActiveUsersQueryDto,
    GetMostActiveUsersQuerySchema,
} from './dto/get-most-active-users';

import { FileValidationPipe } from './pipes/file-size-validation.pipe';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { type UserPayload } from '../utils/extractUserPayload';

import { DeleteUserDocs } from './docs/delete-user.docs';
import { GetSelfDocs } from './docs/get-self.docs';
import { GetUserDocs } from './docs/get-user.docs';
import { GetUsersDocs } from './docs/get-users.docs';
import { UpdateUserDocs } from './docs/update-users.docs';

@Controller('users')
@ApiBearerAuth('Authorization')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('avatar')
    async getAvatars(@User() user: UserPayload): Promise<GetAvatarsDto> {
        return await this.usersService.getAvatars(user.id);
    }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async addAvatar(
        @User() user: UserPayload,
        @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    ) {
        return await this.usersService.uploadAvatar(user.id, file);
    }

    @Delete('avatar')
    async removeAvatar(
        @User() user: UserPayload,
        @Query(new ZodValidationPipe(RemoveAvatarQuerySchema))
        query: RemoveAvatarQueryDto,
    ) {
        return await this.usersService.removeAvatar(user.id, query.name);
    }

    @Get('most-active')
    async getMostActiveUsers(
        @Query(new ZodValidationPipe(GetMostActiveUsersQuerySchema))
        query: GetMostActiveUsersQueryDto,
    ) {
        return await this.usersService.findMostActive(
            query.ageFrom,
            query.ageTo,
        );
    }

    @Get()
    @GetUsersDocs()
    async getUsers(
        @Query(new ZodValidationPipe(GetUsersQuerySchema))
        query: GetUsersQueryDto,
    ): Promise<GetUsersDto> {
        return await this.usersService.findAll(query.filter, query.page);
    }

    @Get('my')
    @GetSelfDocs()
    async getSelf(@User() user: UserPayload): Promise<GetUserDto> {
        return await this.usersService.findOneStrict({ id: user.id });
    }

    @Get(':id')
    @GetUserDocs()
    async getUser(@Param('id') id: string): Promise<GetUserDto> {
        return await this.usersService.findOneStrict({ id });
    }

    @Patch()
    @UpdateUserDocs()
    async updateUser(
        @User() user: UserPayload,
        @Body(new ZodValidationPipe(UpdateUserSchema)) body: UpdateUserDto,
    ) {
        return await this.usersService.updateOne(user.id, body);
    }

    @Delete()
    @DeleteUserDocs()
    async deleteUser(@User() user: UserPayload) {
        return await this.usersService.deleteOne(user.id);
    }
}
