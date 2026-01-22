import { Request, Response } from 'express';
import { z } from 'zod';
import { registerUserUseCase } from '../infrastructure/di/auth.container';

/**
 * Registration Controller (Hexagonal Adapter)
 * Handles user registration with validation and security
 */

// Validation schema for registration
const registerSchema = z.object({
    ci: z.string()
        .min(10, 'CI debe tener al menos 10 dígitos')
        .max(13, 'CI no puede exceder 13 dígitos')
        .regex(/^\d+$/, 'CI debe contener solo números'),
    nombre: z.string()
        .min(2, 'Nombre debe tener al menos 2 caracteres')
        .max(200, 'Nombre no puede exceder 200 caracteres')
        .trim(),
    email: z.string()
        .email('Email inválido')
        .toLowerCase()
        .trim(),
    telefono: z.string()
        .regex(/^\d{10}$/, 'Teléfono debe tener 10 dígitos')
        .optional()
        .or(z.literal('')),
    password: z.string()
        .min(8, 'Contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
        .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número')
});

export class RegisterController {
    /**
     * Register new user
     * POST /api/auth/register
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            // Validate request body
            const data = registerSchema.parse(req.body);

            console.log(`[REGISTER] Registration attempt for CI: ${data.ci}`);

            const result = await registerUserUseCase.execute(data);

            console.log(`[REGISTER] User created successfully: ${result.user.ci}`);

            // Return user data and tokens
            res.status(201).json({
                success: true,
                message: 'Registro exitoso',
                data: result
            });

        } catch (error: any) {
            if (error instanceof z.ZodError) {
                const firstError = error.errors[0];
                res.status(400).json({
                    success: false,
                    message: firstError.message,
                    field: firstError.path[0],
                    errors: error.errors
                });
                return;
            }

            console.error('[REGISTER] Registration error:', error.message);

            if (error.message === 'User with this CI already exists') {
                res.status(409).json({
                    success: false,
                    message: 'Ya existe un usuario con esta cédula',
                    field: 'ci'
                });
                return;
            }

            if (error.message === 'User with this Email already exists') {
                res.status(409).json({
                    success: false,
                    message: 'Ya existe un usuario con este email',
                    field: 'email'
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
