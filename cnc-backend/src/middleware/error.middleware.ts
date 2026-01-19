import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    // Error de validación de Zod
    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: 'Datos inválidos',
            details: err.errors
        });
    }

    // Error de Prisma (base de datos)
    if (err.code && err.code.startsWith('P')) {
        if (err.code === 'P2002') {
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
    res.status(statusCode).json({
        error: err.message || 'Error interno del servidor'
    });
};
