import 'dotenv/config';

import { DataSource } from 'typeorm';
import { getAppConfig } from './config/app.config';
import { CreateUsersTable1760296278140 } from './migrations/1760296278140-createUsersTable';
import { FillUsersTable1762110059284 } from './migrations/1762110059284-fillUsersTable';
import { User } from './users/user.entity';
import { CreateAvatarsTable1765644940576 } from './migrations/1765644940576-createAvatarsTable';
import { Avatar } from './users/avatars.entity';

const {
    POSTGRES_DATABASE,
    POSTGRES_HOST,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
    POSTGRES_USER,
} = getAppConfig();

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
    ],
    entities: [User, Avatar],
});
