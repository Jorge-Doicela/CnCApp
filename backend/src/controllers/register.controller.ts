import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { PasswordService } from '../services/password.service';
import { JWTService } from '../services/jwt.service';

/**
 * Registration Controller
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
        .regex(/[0-9]/, 'Debe contener al menos un número'),
    entidadId: z.number().optional()
});

export class RegisterController {
    /**
     * Register new user
     * POST /api/auth/register
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            // Validate request body
            const validatedData = registerSchema.parse(req.body);

            console.log(`[REGISTER] Registration attempt for CI: ${validatedData.ci}`);

            // Check if CI already exists
            const existingUserByCi = await prisma.usuario.findUnique({
                where: { ci: validatedData.ci }
            });

            if (existingUserByCi) {
                console.log(`[REGISTER] CI already exists: ${validatedData.ci}`);
                res.status(409).json({
                    success: false,
                    message: 'Ya existe un usuario con esta cédula',
                    field: 'ci'
                });
                return;
            }

            // Check if email already exists
            const existingUserByEmail = await prisma.usuario.findFirst({
                where: { email: validatedData.email }
            });

            if (existingUserByEmail) {
                console.log(`[REGISTER] Email already exists: ${validatedData.email}`);
                res.status(409).json({
                    success: false,
                    message: 'Ya existe un usuario con este email',
                    field: 'email'
                });
                return;
            }

            // Hash password
            const hashedPassword = await PasswordService.hash(validatedData.password);

            // Get default role (Participante - ID: 4)
            const defaultRole = await prisma.rol.findFirst({
                where: { nombre: 'Participante' }
            });

            if (!defaultRole) {
                console.error('[REGISTER] Default role "Participante" not found');
                res.status(500).json({
                    success: false,
                    message: 'Error en la configuración del sistema'
                });
                return;
            }

            // Get default entity (CNC)
            const defaultEntity = await prisma.entidad.findFirst({
                where: { nombre: 'Consejo Nacional de Competencias' }
            });

            // Create user
            const newUser = await prisma.usuario.create({
                data: {
                    ci: validatedData.ci,
                    nombre: validatedData.nombre,
                    email: validatedData.email,
                    telefono: validatedData.telefono || null,
                    password: hashedPassword,
                    rolId: defaultRole.id,
                    entidadId: defaultEntity?.id || null,
                    tipoParticipante: 0
                },
                include: {
                    rol: true,
                    entidad: true
                }
            });

            console.log(`[REGISTER] User created successfully: ${newUser.ci}`);

            // Generate tokens
            const tokens = JWTService.generateTokens({
                userId: newUser.id,
                ci: newUser.ci,
                roleId: newUser.rolId || 0
            });

            // Return user data and tokens
            res.status(201).json({
                success: true,
                message: 'Registro exitoso',
                data: {
                    user: {
                        id: newUser.id,
                        ci: newUser.ci,
                        nombre: newUser.nombre,
                        email: newUser.email,
                        telefono: newUser.telefono,
                        rol: newUser.rol,
                        entidad: newUser.entidad
                    },
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken
                }
            });

        } catch (error) {
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

            console.error('[REGISTER] Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
