import winston from 'winston';

// Definir niveles de log personalizados
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Definir colores para cada nivel
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Agregar colores a winston
winston.addColors(colors);

// Formato para desarrollo
const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
    )
);

// Formato para producción
const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Determinar nivel según entorno
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};

// Crear transports
const transports = [
    // Console transport
    new winston.transports.Console(),

    // File transport para errores
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
    }),

    // File transport para todos los logs
    new winston.transports.File({ filename: 'logs/combined.log' }),
];

// Crear logger
const logger = winston.createLogger({
    level: level(),
    levels,
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    transports,
});

export default logger;
