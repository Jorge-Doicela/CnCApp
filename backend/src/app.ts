import 'reflect-metadata';
import './config/di.container';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import logger from './config/logger';

// Importar rutas
import authRoutes from './infrastructure/web/routes/auth.routes';
import userRoutes from './infrastructure/web/routes/user.routes';
import capacitacionRoutes from './infrastructure/web/routes/capacitacion.routes';
import certificadoRoutes from './infrastructure/web/routes/certificado.routes';

// Importar middleware
import { errorHandler } from './infrastructure/web/middleware/error.middleware';
import { notFound } from './infrastructure/web/middleware/notFound.middleware';

const app: Application = express();
const PORT = env.PORT;

// ============================================
// MIDDLEWARE DE SEGURIDAD
// ============================================

// Helmet - Protección de headers HTTP
app.use(helmet());

// CORS - Permitir peticiones desde el frontend
app.use(cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true
}));

// Rate Limiting - Prevenir ataques de fuerza bruta
const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde'
});
app.use('/api/', limiter);

// ============================================
// MIDDLEWARE GENERAL
// ============================================

// Comprimir respuestas
app.use(compression());

// Logging de peticiones
if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// RUTAS
// ============================================

// Ruta de health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV
    });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/capacitaciones', capacitacionRoutes);
app.use('/api/certificados', certificadoRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// 404 - Ruta no encontrada
app.use(notFound);

// Error handler global
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    logger.info(`URL: http://localhost:${PORT}`);
});

export default app;
