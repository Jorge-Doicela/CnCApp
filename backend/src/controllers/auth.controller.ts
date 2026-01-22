import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { PasswordService } from '../services/password.service';
import { JWTService } from '../services/jwt.service';

/**
 * Authentication Controller
 * Handles login, logout, and token refresh
 */

// Validation schemas
const loginSchema = z.object({
    ci: z.string().min(10).max(13),
    password: z.string().min(8),
});

export class AuthController {
    /**
     * Login endpoint
     * POST /api/auth/login
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            // Validate request body
            const { ci, password } = loginSchema.parse(req.body);

            console.log(`[AUTH] Login attempt for CI: ${ci}`);

            // Find user by CI
            const user = await prisma.usuario.findUnique({
                where: { ci },
                include: {
                    rol: true,
                    entidad: true,
                },
            });

            if (!user) {
                console.log(`[AUTH] User not found: ${ci}`);
                res.status(401).json({
                    success: false,
                    message: 'Cédula o contraseña incorrectos',
                });
                return;
            }

            // Verify password
            const isPasswordValid = await PasswordService.verify(password, user.password);

            if (!isPasswordValid) {
                console.log(`[AUTH] Invalid password for CI: ${ci}`);
                res.status(401).json({
                    success: false,
                    message: 'Cédula o contraseña incorrectos',
                });
                return;
            }

            // Generate tokens
            const tokens = JWTService.generateTokens({
                userId: user.id,
                ci: user.ci,
                roleId: user.rolId || 0,
            });

            console.log(`[AUTH] Login successful for CI: ${ci}`);

            // Return user data and tokens
            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        ci: user.ci,
                        nombre: user.nombre,
                        email: user.email,
                        telefono: user.telefono,
                        rol: user.rol,
                        entidad: user.entidad,
                    },
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                },
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: error.errors,
                });
                return;
            }

            console.error('[AUTH] Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
            });
        }
    }

    /**
     * Refresh token endpoint
     * POST /api/auth/refresh
     */
    static async refresh(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: 'Refresh token requerido',
                });
                return;
            }

            // Verify refresh token
            const payload = JWTService.verify(refreshToken);

            // Generate new tokens
            const tokens = JWTService.generateTokens({
                userId: payload.userId,
                ci: payload.ci,
                roleId: payload.roleId,
            });

            res.json({
                success: true,
                data: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                },
            });
        } catch (error) {
            console.error('[AUTH] Refresh error:', error);
            res.status(401).json({
                success: false,
                message: 'Token inválido o expirado',
            });
        }
    }

    /**
     * Logout endpoint
     * POST /api/auth/logout
     */
    static async logout(_req: Request, res: Response): Promise<void> {
        // In a production app, you would invalidate the token here
        // For now, we just return success
        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente',
        });
    }
}
