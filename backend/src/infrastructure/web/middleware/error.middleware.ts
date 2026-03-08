import { Request, Response, NextFunction } from 'express';
import { DomainError, ValidationError, AuthenticationError, NotFoundError } from '../../../domain/shared/errors';
import { ZodError } from 'zod';
import logger from '../../../config/logger';

// Interface extendida para errores
interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

// Middleware global de manejo de errores
export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Log del error con stack para debugging
    logger.error(`Error: ${err.message}`, {
        stack: err.stack,
        url: _req.url,
        method: _req.method,
        ip: _req.ip
    });

    if (err instanceof DomainError) {
        if (err instanceof ValidationError) {
            res.status(400).json({ message: err.message });
            return;
        }
        if (err instanceof AuthenticationError) {
            res.status(401).json({ message: err.message });
            return;
        }
        if (err instanceof NotFoundError) {
            res.status(404).json({ message: err.message });
            return;
        }
        // Default DomainError
        res.status(400).json({ message: err.message });
        return;
    }

    // Error de validación de Zod
    if (err instanceof ZodError) {
        res.status(400).json({
            message: 'Datos inválidos',
            details: err.errors
        });
        return;
    }

    // Error de Prisma (base de datos)
    if (err.code && err.code.startsWith('P')) {
        switch (err.code) {
            case 'P2002':
                res.status(409).json({
                    message: 'Ya existe un registro con esos datos de forma única en el sistema.'
                });
                return;
            case 'P2003':
                res.status(400).json({
                    message: `Error de integridad referencial. El ID proporcionado no existe en la base de datos original.`,
                    code: err.code,
                    meta: (err as any).meta
                });
                return;
            case 'P2025':
                res.status(404).json({
                    message: 'El registro solicitado no fue encontrado o no se pudo actualizar.',
                    code: err.code
                });
                return;
            default:
                res.status(400).json({
                    message: `Error en la base de datos: ${err.message}`, // MODIFIED FOR DEBUGGING
                    code: err.code,
                    meta: (err as any).meta
                });
                return;
        }
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            message: 'Token inválido'
        });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            message: 'Token expirado'
        });
        return;
    }

    // Error genérico
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Error interno del servidor' : err.message;

    res.status(statusCode).json({
        message: message
    });
};
