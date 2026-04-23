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
import rolRoutes from './infrastructure/web/routes/rol.routes';
import entidadRoutes from './infrastructure/web/routes/entidad.routes';
import capacitacionRoutes from './infrastructure/web/routes/capacitacion.routes';
import certificadoRoutes from './infrastructure/web/routes/certificado.routes';
import ubicacionRoutes from './infrastructure/web/routes/ubicacion.routes';
import reportesRoutes from './infrastructure/web/routes/reportes.routes';
import cargoRoutes from './infrastructure/web/routes/cargo.routes';
import institucionRoutes from './infrastructure/web/routes/institucion.routes';
import plantillaRoutes from './infrastructure/web/routes/plantilla.routes';
import usuarioCapacitacionRoutes from './infrastructure/web/routes/usuario-capacitacion.routes';
import competenciaRoutes from './infrastructure/web/routes/competencia.routes';
import { catalogoRoutes } from './infrastructure/web/routes/catalogo.routes';
import { gradoOcupacionalRoutes } from './infrastructure/web/routes/grado-ocupacional.routes';
import cronRoutes from './infrastructure/web/routes/cron.routes';

// Importar middleware
import { errorHandler } from './infrastructure/web/middleware/error.middleware';
import { notFound } from './infrastructure/web/middleware/notFound.middleware';

// Importar scheduler
import { initCapacitacionScheduler } from './infrastructure/scheduler/capacitacion.scheduler';

// ============================================
// MANEJO DE CAÍDAS CRÍTICAS DE NODE.JS
// ============================================
// Estas reglas mantienen el servidor encendido 24/7 incluso si ocurre un error asíncrono no atrapado
process.on('uncaughtException', (error) => {
    logger.error('💥 FATAL ERROR: Excepción no capturada (uncaughtException) - Evitando caída del Servidor', { error: error.message, stack: error.stack });
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 FATAL ERROR: Promesa rechazada sin atrapar (unhandledRejection) - Evitando caída del Servidor', { reason, promise });
});

const app: Application = express();
const PORT = env.PORT;

// ============================================
// MIDDLEWARE DE SEGURIDAD
// ============================================

// Helmet - Protección de headers HTTP
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS - Permitir peticiones desde el frontend
const allowedOrigins = Array.isArray(env.ALLOWED_ORIGINS)
    ? env.ALLOWED_ORIGINS
    : (env.ALLOWED_ORIGINS as string).split(',');

app.use(cors({
    origin: (origin, callback) => {
        // Permitir peticiones sin origin (como apps móviles o curl)
        if (!origin || env.NODE_ENV === 'production') return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Rate Limiting - Prevenir ataques de fuerza bruta
// Se aplica un límite estricto solo a las rutas de autenticación y un límite
// amplio al resto de la API, ya que múltiples usuarios pueden compartir la misma IP en red local.
const authLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,        // 15 minutos
    max: 50,                                    // máx 50 intentos de login por IP
    message: 'Demasiados intentos de autenticación desde esta IP, intenta de nuevo más tarde',
    skipSuccessfulRequests: true                // no contar las peticiones exitosas
});

if (env.RATE_LIMIT_MAX_REQUESTS > 0) {
    const generalLimiter = rateLimit({
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        max: env.RATE_LIMIT_MAX_REQUESTS * 10, // 10x más permisivo para la API general
        message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde'
    });
    app.use('/api/', generalLimiter);
    logger.info(`Rate limiting general: ${env.RATE_LIMIT_MAX_REQUESTS * 10} req/${env.RATE_LIMIT_WINDOW_MS}ms`);
} else {
    logger.info('Rate limiting general esta desactivado (RATE_LIMIT_MAX_REQUESTS = 0)');
}

// Aplicar límite estricto solo a rutas de autenticación (sensibles a fuerza bruta)
app.use('/api/auth/', authLimiter);

// ============================================
// MIDDLEWARE GENERAL
// ============================================

// Comprimir respuestas
app.use(compression());

// Logging de peticiones
if (env.NODE_ENV === 'development' && env.DEBUG_API) {
    app.use(morgan('dev'));
} else if (env.NODE_ENV === 'development') {
    app.use(morgan('tiny'));
} else {
    app.use(morgan('combined'));
}

// Parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (Certificados, etc.)
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use((_req, _res, next) => next());

// ============================================
// RUTAS
// ============================================


// Health Check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Rutas de la API (Públicas y Catálogos van primero)
app.use('/api', catalogoRoutes); // Generos, Etnias, Nacionalidades, (cargos, entidades pub)
app.use('/api', ubicacionRoutes); // Provincias y Cantones
app.use('/api/auth', authRoutes);

// Rutas Restringidas (Requieren Auth)
// Debug Log Capture (For remote debugging) - Restored for Camera troubleshooting
app.post('/api/debug/log', (req, res) => {
    const { level, message, data } = req.body;
    if (level === 'error' || level === 'warn') {
        const logMsg = `[FRONTEND_REMOTE] ${message}`;
        if (level === 'error') logger.error(logMsg, data);
        else logger.warn(logMsg, data);
    }
    res.status(200).send();
});
app.use('/api/users', userRoutes);
app.use('/api/rol', rolRoutes); // Singular to match frontend service
app.use('/api/entidades', entidadRoutes); // Plural to match frontend service
app.use('/api/capacitaciones', capacitacionRoutes);
app.use('/api/certificados', certificadoRoutes);
app.use('/api/cargos', cargoRoutes);
app.use('/api/instituciones', institucionRoutes);
app.use('/api/grados-ocupacionales', gradoOcupacionalRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/plantillas', plantillaRoutes);
app.use('/api/usuarios-capacitaciones', usuarioCapacitacionRoutes);
app.use('/api/competencias', competenciaRoutes);
app.use('/api/cron', cronRoutes);

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

import { checkDatabaseConnection } from './config/database';

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, async () => {
        logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
        logger.info(`URL: http://localhost:${PORT}`);

        // Verificar conexión a DB antes de iniciar procesos secundarios
        const isDbConnected = await checkDatabaseConnection();

        if (isDbConnected) {
            // Iniciar el scheduler de finalización automática de capacitaciones
            initCapacitacionScheduler();
        } else {
            logger.warn('⚠️ [Server] El scheduler no se inició debido a problemas de conexión con la base de datos');
        }
    });
}

export default app;