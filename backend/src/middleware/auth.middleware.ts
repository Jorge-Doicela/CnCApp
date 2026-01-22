import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '../services/jwt.service';

/**
 * Extend Express Request to include user data
 */
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user data to request
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido',
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const payload = JWTService.verify(token);

        // Attach user data to request
        req.user = payload;

        next();
    } catch (error) {
        console.error('[AUTH_MIDDLEWARE] Error:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
        });
    }
}
