import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { RegisterUserUseCase } from '../../../application/auth/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../../application/auth/use-cases/login-user.use-case';
import { GetUserProfileUseCase } from '../../../application/user/use-cases/get-user-profile.use-case';
import { AuthRequest } from '../middleware/auth.middleware';

// Schemas
const registerSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    ci: z.string().length(10, 'La cédula debe tener 10 dígitos'),
    email: z.string().email('Email inválido'),
    telefono: z.string().optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    tipoParticipante: z.number().int().min(0).max(3).optional()
});

const loginSchema = z.object({
    ci: z.string().length(10, 'La cédula debe tener 10 dígitos'),
    password: z.string().min(1, 'La contraseña es requerida')
});

@injectable()
export class AuthController {
    constructor(
        private registerUseCase: RegisterUserUseCase,
        private loginUseCase: LoginUserUseCase,
        private getProfileUseCase: GetUserProfileUseCase
    ) { }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = registerSchema.parse(req.body);
            const result = await this.registerUseCase.execute({
                ci: data.ci as string,
                nombre: data.nombre as string,
                email: data.email as string,
                password: data.password as string,
                telefono: data.telefono
            });
            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                ...result
            });
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = loginSchema.parse(req.body);
            // Updated to match Use Case signature execute(ci, password)
            const result = await this.loginUseCase.execute(data.ci, data.password);
            res.json({
                message: 'Inicio de sesión exitoso',
                ...result
            });
        } catch (error) {
            next(error);
        }
    };

    getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }
            const user = await this.getProfileUseCase.execute(req.userId);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };
}
