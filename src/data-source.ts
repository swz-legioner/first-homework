import { DataSource } from 'typeorm';
import { DATABASE_CONFIG } from './const/database-config';
import { CreateUsersTable1760296278140 } from './migrations/1760296278140-createUsersTable';
import { FillUsersTable1762110059284 } from './migrations/1762110059284-fillUsersTable';
import { AddDeletedDateToUsers1762157225612 } from './migrations/1762157225612-addDeletedDateToUsers';
import { User } from './users/user.entity';

export const AppDataSource = new DataSource({
    ...DATABASE_CONFIG,
    migrations: [
        CreateUsersTable1760296278140,
        FillUsersTable1762110059284,
        AddDeletedDateToUsers1762157225612,
    ],
    entities: [User],
});
