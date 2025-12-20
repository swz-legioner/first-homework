import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { Avatar } from './avatars.entity';

import { FilesModule } from 'src/providers/files/files.module';

@Module({
    imports: [TypeOrmModule.forFeature([User, Avatar]), FilesModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
