import { registerAs } from '@nestjs/config';
import z from 'zod';

export const appConfigSchema = z.object({
    PORT: z.coerce.number().default(3000),
    JWT_SECRET: z.string().min(1),
    POSTGRES_PORT: z.coerce.number().default(5432),
    POSTGRES_HOST: z.string().min(1).default('localhost'),
    POSTGRES_USER: z.string().min(1).default('postgres'),
    POSTGRES_PASSWORD: z.string().min(1).default('postgres'),
    POSTGRES_DATABASE: z.string().min(1).default('homework'),
    MINIO_ACCESS_KEY: z.string().min(1),
    MINIO_SECRET_KEY: z.string().min(1),
    MINIO_HOST: z.string().min(1).default('127.0.0.1'),
    MINIO_API_PORT: z.string().min(1).default('9000'),
});

export type AppConfigEnv = z.infer<typeof appConfigSchema>;

export const getAppConfig = (): AppConfigEnv => {
    return appConfigSchema.parse(process.env);
};

export default registerAs('app', () => {
    const env = getAppConfig();

    return {
        db: {
            type: 'postgres' as const,
            port: env.POSTGRES_PORT,
            host: env.POSTGRES_HOST,
            username: env.POSTGRES_USER,
            password: env.POSTGRES_PASSWORD,
            database: env.POSTGRES_DATABASE,
        },
        http: {
            port: env.PORT,
        },
        jwt: {
            secret: env.JWT_SECRET,
        },
        minio: {
            access: env.MINIO_ACCESS_KEY,
            secret: env.MINIO_SECRET_KEY,
            host: env.MINIO_HOST,
            port: env.MINIO_API_PORT,
        },
    };
});
