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
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
    DEBUG_API: z.string().transform(v => v === 'true').default('false'),

    // Database
    DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid URL" }),

    // Security
    JWT_SECRET: z.string().min(10, { message: "JWT_SECRET must be at least 10 characters long" }),
    JWT_REFRESH_SECRET: z.string().min(10, { message: "JWT_REFRESH_SECRET must be at least 10 characters long" }),
    JWT_EXPIRES_IN: z.string().default('24h'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    BCRYPT_ROUNDS: z.string().transform(Number).default('10'),
    RECAPTCHA_SECRET_KEY: z.string(),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('1000'),

    // CORS
    ALLOWED_ORIGINS: z.string().transform(origins => origins.split(',')).default('http://localhost:8100,http://localhost:4200'),

    // Storage
    UPLOAD_DIR: z.string().default('public/uploads'),
    BASE_URL: z.string().url().default('http://localhost:3000'),
    FRONTEND_URL: z.string().url().default('http://localhost:8100'),

    // SMTP Mailer
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_SECURE: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
});

// Validar y exportar la configuración
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(_env.error.format(), null, 4));
    process.exit(1);
}

export const env = _env.data;
