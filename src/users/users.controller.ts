import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Patch,
    Query,
    Req,
    UnauthorizedException,
    UsePipes,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { GetUserDto } from './dto/get-user.dto';
import {
    GetUsersQueryDto,
    GetUsersQuerySchema,
} from './dto/get-users-query.dto';
import { GetUsersDto, GetUsersSchema } from './dto/get-users.dto';
import { UpdateUserDto, UpdateUserSchema } from './dto/update-user.dto';

import { UserNotFoundError } from 'src/errors/UserNotFound';
import { BadPageError } from './errors/bad-page';
import { ExpectedNothingUpdatedError } from './errors/expected-nothing-updated';
import { UnexpectedNothingDeletedError } from './errors/unexpected-nothing-deleted';
import { UnexpectedNothingUpdatedError } from './errors/unexpected-nothing-updated';

import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { UserPayload } from '../utils/extractUserPayload';

@Controller('users')
@ApiBearerAuth('Authorization')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get()
    @ApiOperation({
        summary: 'List of users with a (partial) filter match in username',
    })
    @ApiResponse({ status: 200, type: GetUsersDto })
    @ApiResponse({
        status: 400,
        description: 'Attempt to request a non-existent page',
    })
    async getUsers(
        @Query(new ZodValidationPipe(GetUsersQuerySchema))
        query: GetUsersQueryDto,
    ): Promise<GetUsersDto> {
        try {
            return await this.usersService.findAll(query.filter, query.page);
        } catch (e) {
            if (e instanceof BadPageError) {
                throw new BadRequestException('No such page');
            }

            throw new InternalServerErrorException('Unhandled error');
        }
    }

    @Get(':id')
    @ApiOperation({
        summary: 'User with a suitable ID, or your profile if id=my',
    })
    @ApiParam({
        name: 'id',
        examples: {
            '1': { description: 'User with id=1' },
            my: { description: 'Your profile' },
        },
    })
    @ApiResponse({ status: 200, type: GetUserDto })
    @ApiResponse({
        status: 400,
        description: 'Incorrect userId',
    })
    @ApiResponse({
        status: 404,
        description: 'User with id/username not found',
    })
    async getUser(
        @Req() request: Request,
        @Param('id') id: string,
    ): Promise<GetUserDto> {
        let userId: number;

        if (id === 'my') {
            const payload = request['user'] as UserPayload;
            if (!payload) {
                throw new UnauthorizedException('Invalid credentials');
            }
            userId = payload?.id;
        } else {
            userId = Number(id);
        }

        if (isNaN(userId)) {
            throw new BadRequestException('The userId must be a number');
        }

        try {
            const found = await this.usersService.findById(userId);
            if (found === null) {
                throw new NotFoundException('User not found');
            }
            return found;
        } catch (e) {
            if (e instanceof UserNotFoundError) {
                throw new NotFoundException(`User with id=${id} not found`);
            }

            throw new InternalServerErrorException('Unhandled error');
        }
    }

    @Patch()
    @ApiOperation({
        summary: 'Updates your profile with data from the request',
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'User successfully updated' })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    @ApiResponse({
        status: 400,
        description: 'Nothing to update',
    })
    @ApiResponse({
        status: 500,
        description: 'Failed attempt to update/Unhandled',
    })
    @UsePipes(new ZodValidationPipe(UpdateUserSchema))
    async updateUser(@Req() request: Request, @Body() body: UpdateUserDto) {
        const payload = request['user'] as UserPayload;
        if (!payload) {
            throw new UnauthorizedException();
        }

        try {
            return await this.usersService.updateOne(payload?.id, body);
        } catch (e) {
            if (e instanceof UserNotFoundError) {
                throw new NotFoundException('User not found');
            }

            if (e instanceof ExpectedNothingUpdatedError) {
                throw new BadRequestException('Nothing to update');
            }

            if (e instanceof UnexpectedNothingUpdatedError) {
                throw new InternalServerErrorException(
                    'Failed attempt to update user',
                );
            }

            throw new InternalServerErrorException('Unhandled error');
        }
    }

    @Delete()
    @ApiOperation({
        summary: 'Deletes your profile',
    })
    @ApiResponse({ status: 200, description: 'User successfully deleted' })
    @ApiResponse({
        status: 400,
        description: 'User not found or already deleted',
    })
    @ApiResponse({
        status: 500,
        description: 'Failed attempt to delete/Unhandled',
    })
    async deleteUser(@Req() request: Request) {
        const payload = request['user'] as UserPayload;
        if (!payload) {
            throw new UnauthorizedException();
        }

        try {
            return await this.usersService.deleteOne(payload.id);
        } catch (e) {
            if (e instanceof UserNotFoundError) {
                throw new BadRequestException(
                    'User not found or already deleted',
                );
            }

            if (e instanceof UnexpectedNothingDeletedError) {
                throw new InternalServerErrorException(
                    'Failed attempt to delete user',
                );
            }

            throw new InternalServerErrorException('Unhandled error');
        }
    }
}
