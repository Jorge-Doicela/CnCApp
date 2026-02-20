import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId?: number;
    userRole?: number;
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: number;
            roleId?: number;
        };

        // Agregar userId y rol al request
        req.userId = decoded.userId;
        req.userRole = decoded.roleId;

        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// Middleware para verificar roles específicos
export const authorize = (...allowedRoles: number[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userRole) {
            res.status(403).json({ error: 'Acceso denegado - Sin rol asignado' });
            return;
        }

        if (!allowedRoles.includes(req.userRole)) {
            console.log(`[AUTH_DEBUG] Acceso denegado. UserRole: ${req.userRole} (type: ${typeof req.userRole}), Allowed: ${allowedRoles}`);
            res.status(403).json({
                error: 'Acceso denegado - Permisos insuficientes',
                currentRole: req.userRole,
                currentRoleType: typeof req.userRole,
                requiredRoles: allowedRoles
            });
            return;
        }

        next();
    };
};
