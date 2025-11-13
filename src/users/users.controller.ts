import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from './users.service';

import { GetUserDto } from './dto/get-user.dto';
import {
    GetUsersQueryDto,
    GetUsersQuerySchema,
} from './dto/get-users-query.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto, UpdateUserSchema } from './dto/update-user.dto';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { type UserPayload } from '../utils/extractUserPayload';
import { DeleteUserDocs } from './docs/delete-user.docs';
import { GetSelfDocs } from './docs/get-self.docs';
import { GetUserDocs } from './docs/get-user.docs';
import { GetUsersDocs } from './docs/get-users.docs';
import { UpdateUserDocs } from './docs/update-users.docs';
import { User } from './user.decorator';

@Controller('users')
@ApiBearerAuth('Authorization')
export class UsersController {
    constructor(private usersService: UsersService) {}

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
