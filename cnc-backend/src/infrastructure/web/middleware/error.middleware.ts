import { Request, Response, NextFunction } from 'express';
import { DomainError, ValidationError, AuthenticationError, NotFoundError } from '../../../domain/errors';
import { ZodError } from 'zod';

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error('Error:', err);

    if (err instanceof DomainError) {
        if (err instanceof ValidationError) {
            return res.status(400).json({ error: err.message });
        }
        if (err instanceof AuthenticationError) {
            return res.status(401).json({ error: err.message });
        }
        if (err instanceof NotFoundError) {
            return res.status(404).json({ error: err.message });
        }
        // Default DomainError
        return res.status(400).json({ error: err.message });
    }

    // Error de validación de Zod
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Datos inválidos',
            details: err.errors
        });
    }

    // Error de Prisma (base de datos)
    if (err.code && err.code.startsWith('P')) {
        if (err.code === 'P2002') {
            // We should handle this in repository and throw DomainError, but as fallback:
            return res.status(409).json({
                error: 'Ya existe un registro con esos datos'
            });
        }
        return res.status(400).json({
            error: 'Error en la base de datos'
        });
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado'
        });
    }

    // Error genérico
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        error: err.message || 'Error interno del servidor'
    });
};
