import { DataSourceOptions } from 'typeorm';

const host = process.env.POSTGRES_HOST ?? 'localhost';
const port = process.env.POSTGRES_PORT
    ? Number(process.env.POSTGRES_PORT)
    : 5432;

const username = process.env.POSTGRES_USER ?? 'postgres';
const password = process.env.POSTGRES_PASSWORD ?? 'postgres';

export const DATABASE_CONFIG: DataSourceOptions = {
    type: 'postgres',
    database: 'homework',
    host,
    port,
    username,
    password,
};
