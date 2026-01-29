import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { z } from 'zod';
import { RegisterUserUseCase } from '../../../application/auth/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../../application/auth/use-cases/login-user.use-case';
import { GetUserProfileUseCase } from '../../../application/user/use-cases/get-user-profile.use-case';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserMapper } from '../../../domain/user/mappers/user.mapper';

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
        @inject(RegisterUserUseCase) private registerUseCase: RegisterUserUseCase,
        @inject(LoginUserUseCase) private loginUseCase: LoginUserUseCase,
        @inject(GetUserProfileUseCase) private getProfileUseCase: GetUserProfileUseCase
    ) { }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = registerSchema.parse(req.body);

            // Split nombre into parts (simple approach)
            const nameParts = (data.nombre as string).trim().split(' ');
            const primerNombre = nameParts[0] || '';
            const primerApellido = nameParts[nameParts.length - 1] || '';
            const segundoNombre = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : undefined;

            const result = await this.registerUseCase.execute({
                ci: data.ci as string,
                primerNombre,
                segundoNombre,
                primerApellido,
                email: data.email as string,
                password: data.password as string,
                telefono: data.telefono,
                tipoParticipante: data.tipoParticipante
            });

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    user: UserMapper.toDTO(result.user),
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken
                }
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
                success: true,
                message: 'Inicio de sesión exitoso',
                data: {
                    user: UserMapper.toDTO(result.user),
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.userId) {
                res.status(401).json({ success: false, error: 'Usuario no autenticado' });
                return;
            }
            const user = await this.getProfileUseCase.execute(req.userId);
            res.json({
                success: true,
                data: UserMapper.toDTO(user)
            });
        } catch (error) {
            next(error);
        }
    };
}
