import z from 'zod';

export const appConfigSchema = z.object({
    PORT: z.coerce.number().default(3000),
    NOTIFICATIONS_PORT: z.coerce.number().default(3001),
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
    REDIS_PORT: z.string().min(1).default('6379'),
    REDIS_PASSWORD: z.string().min(1).default(''),
    KAFKA_PORT_1: z.string().min(1).default(''),
    KAFKA_PORT_2: z.string().min(1).default(''),
    ADMIN_PASSWORD: z.string().min(1),
    MONGODB_PORT: z.string().min(1).default('27017'),
    MONGODB_USER: z.string(),
    MONGODB_PASSWORD: z.string(),
});

export type AppConfigEnv = z.infer<typeof appConfigSchema>;

export const getEnv = (): AppConfigEnv => {
    return appConfigSchema.parse(process.env);
};

export function getConfig(env?: AppConfigEnv) {
    if (!env) {
        env = getEnv();
    }

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
            notifications_port: env.NOTIFICATIONS_PORT,
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
        redis: {
            port: env.REDIS_PORT,
            password: env.REDIS_PASSWORD,
        },
        kafka: {
            first_port: env.KAFKA_PORT_1,
            second_port: env.KAFKA_PORT_2,
        },
        mongo: {
            port: env.MONGODB_PORT,
            user: env.MONGODB_USER,
            password: env.MONGODB_PASSWORD,
        },
    };
}
