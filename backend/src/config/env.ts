import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
    // Server Config
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('3000'),
    API_PREFIX: z.string().default('/api'),

    // Database
    DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid URL" }),

    // Security
    JWT_SECRET: z.string().min(10, { message: "JWT_SECRET must be at least 10 characters long" }),
    JWT_EXPIRES_IN: z.string().default('24h'),
    BCRYPT_ROUNDS: z.string().transform(Number).default('10'),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

    // CORS
    ALLOWED_ORIGINS: z.string().transform(origins => origins.split(',')).default('http://localhost:8100,http://localhost:4200'),
});

// Validar y exportar la configuración
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(_env.error.format(), null, 4));
    process.exit(1);
}

export const env = _env.data;
