import { Request, Response } from 'express';
import { z } from 'zod';
import { loginUserUseCase, registerUserUseCase, refreshTokenUseCase } from '../infrastructure/di/auth.container';

/**
 * Authentication Controller (Hexagonal Adapter)
 * Maps HTTP requests to Domain Use Cases
 */

// Validation schemas (adapters responsibility to validate shape)
const loginSchema = z.object({
    ci: z.string().min(10).max(13),
    password: z.string().min(8),
});

const registerSchema = z.object({
    ci: z.string().min(10).max(13),
    nombre: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    telefono: z.string().optional()
});

export class AuthController {
    /**
     * Login endpoint
     * POST /api/auth/login
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { ci, password } = loginSchema.parse(req.body);

            console.log(`[AUTH] Login attempt for CI: ${ci}`);

            const result = await loginUserUseCase.execute(ci, password);

            console.log(`[AUTH] Login successful for CI: ${ci}`);

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: error.errors,
                });
                return;
            }

            console.error('[AUTH] Login error:', error.message);

            // Map domain errors to HTTP status
            if (error.message === 'Invalid credentials') {
                res.status(401).json({
                    success: false,
                    message: 'Cédula o contraseña incorrectos',
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
            });
        }
    }

    /**
     * Register endpoint
     * POST /api/auth/register
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const data = registerSchema.parse(req.body);

            console.log(`[AUTH] Register attempt for CI: ${data.ci}`);

            const result = await registerUserUseCase.execute(data);

            console.log(`[AUTH] Register successful for CI: ${data.ci}`);

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: error.errors,
                });
                return;
            }

            console.error('[AUTH] Register error:', error.message);

            if (error.message === 'User with this CI already exists') {
                res.status(409).json({
                    success: false,
                    message: 'El usuario ya existe',
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
            });
        }
    }

    /**
     * Refresh logic (Pending UseCase refactor - Keeping as is for MVP stability if not strictly required immediately)
     * For full hex, needs RefreshTokenUseCase.
     * I will keep legacy logic momentarily or implement small inline logic using provider directly?
     * No, let's keep it clean. For now I'll use the provider directly here as a pragmatic shortcut
     * or create a quick use case. Let's use provider directly to save time, but it breaks strict hex.
     * Better: Just comment it out or leave basic implementation.
     */
    static async refresh(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({ success: false, message: 'Refresh token is required' });
                return;
            }

            const result = await refreshTokenUseCase.execute(refreshToken);
            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: 'Sesión expirada o inválida'
            });
        }
    }

    static async logout(_req: Request, res: Response): Promise<void> {
        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente',
        });
    }
}
