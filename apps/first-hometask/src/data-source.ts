import 'dotenv/config';

import { DataSource } from 'typeorm';

import { getEnv } from '@app/common';

import { User } from './users/user.entity';
import { Avatar } from './users/avatars.entity';

import { FillUsersTable1762110059284 } from './migrations/1762110059284-fillUsersTable';
import { CreateUsersTable1760296278140 } from './migrations/1760296278140-createUsersTable';
import { CreateAvatarsTable1765644940576 } from './migrations/1765644940576-createAvatarsTable';
import { AddBalanceToUsers1767535467162 } from './migrations/1767535467162-addBalanceToUsers';

const {
    POSTGRES_DATABASE,
    POSTGRES_HOST,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
    POSTGRES_USER,
} = getEnv();

export const AppDataSource = new DataSource({
    type: 'postgres',
    database: POSTGRES_DATABASE,
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    migrations: [
        CreateUsersTable1760296278140,
        FillUsersTable1762110059284,
        CreateAvatarsTable1765644940576,
        AddBalanceToUsers1767535467162,
    ],
    entities: [User, Avatar],
});
