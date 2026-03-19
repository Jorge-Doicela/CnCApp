import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import prisma from '../../../config/database';

export interface AuthRequest extends Request {
    userId?: number;
    userRole?: number;
    userRoleName?: string;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No autorizado - Token no proporcionado' });
            return;
        }

        const token = authHeader.substring(7); // Remover 'Bearer '

        // Verificar token
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
            userId: number;
            roleId?: number;
            roleName?: string;
        };

        // Agregar userId y rol al request
        // En JWT, los números a veces llegan como string; Prisma requiere Int válido en `where`.
        const userId = Number(decoded.userId);
        if (!Number.isFinite(userId)) {
            res.status(401).json({ error: 'Token inválido - userId no numérico' });
            return;
        }
        req.userId = userId;
        req.userRole = decoded.roleId;
        req.userRoleName = decoded.roleName;

        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// Middleware para verificar roles específicos por nombre
export const authorize = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userRoleName) {
            console.log(`[AUTH_DEBUG] Acceso denegado - Sin rol en el request. userId: ${req.userId}`);
            res.status(403).json({ error: 'Acceso denegado - Sin rol asignado' });
            return;
        }

        if (!allowedRoles.includes(req.userRoleName)) {
            console.log(`[AUTH_DEBUG] Acceso denegado. UserRoleName: ${req.userRoleName}, Allowed: ${allowedRoles}`);
            res.status(403).json({
                error: 'Acceso denegado - Permisos insuficientes',
                currentRoleName: req.userRoleName,
                requiredRoles: allowedRoles
            });
            return;
        }

        next();
    };
};

// Middleware para verificar si el usuario tiene asignado un módulo específico (Tiempo real en DB)
export const requireModule = (...requiredModules: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        if (!req.userId) {
            res.status(401).json({ error: 'No autorizado - Sin usuario' });
            return;
        }

        try {
            const userId = Number(req.userId);
            if (!Number.isFinite(userId)) {
                res.status(401).json({ error: 'Token inválido - userId no numérico' });
                return;
            }
            const user = await prisma.usuario.findUnique({
                where: { id: userId },
                include: { rol: true }
            });

            if (!user) {
                res.status(401).json({ error: 'Fallo de seguridad - Usuario no encontrado' });
                return;
            }

            const userModules = Array.isArray(user.rol?.modulos) ? (user.rol?.modulos as string[]) : [];
            const hasModule = requiredModules.some(mod => userModules.includes(mod));

            if (!hasModule) {
                console.log(`[AUTH_DEBUG] Acceso denegado a módulo. UserId: ${req.userId}, Requerido: ${requiredModules}`);
                res.status(403).json({
                    error: 'Acceso denegado - Módulo no asignado',
                    requiredModules
                });
                return;
            }

            next();
        } catch (error) {
            console.error('[AUTH_DEBUG] Error interno validando módulos:', error);
            res.status(500).json({ error: 'Error del servidor en validación de permisos' });
        }
    };
};
