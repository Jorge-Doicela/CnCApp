import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { z } from 'zod';
import { RegisterUserUseCase } from '../../../application/auth/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../../application/auth/use-cases/login-user.use-case';
import { GetUserProfileUseCase } from '../../../application/user/use-cases/get-user-profile.use-case';
import { AuthRequest } from '../middleware/auth.middleware';

// Strip password from user object before sending to client
const toDTO = (user: any) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// Schemas
const registerSchema = z.object({
    primerNombre: z.string().min(2, 'El primer nombre es requerido'),
    segundoNombre: z.string().optional(),
    primerApellido: z.string().min(2, 'El primer apellido es requerido'),
    segundoApellido: z.string().optional(),
    ci: z.string().length(10, 'La cédula debe tener 10 dígitos'),
    email: z.string().email('Email inválido'),
    telefono: z.string().optional(),
    celular: z.string().optional(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    tipoParticipanteId: z.number().int().optional(),
    provinciaId: z.number().optional(),
    cantonId: z.number().optional(),
    generoId: z.number().optional(),
    etniaId: z.number().optional()
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

            const result = await this.registerUseCase.execute({
                ci: data.ci as string,
                primerNombre: data.primerNombre,
                segundoNombre: data.segundoNombre,
                primerApellido: data.primerApellido,
                segundoApellido: data.segundoApellido,
                email: data.email as string,
                password: data.password as string,
                telefono: data.telefono,
                celular: data.celular,
                tipoParticipanteId: data.tipoParticipanteId,
                provinciaId: data.provinciaId,
                cantonId: data.cantonId,
                generoId: data.generoId,
                etniaId: data.etniaId
            });

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    user: toDTO(result.user),
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
            const result = await this.loginUseCase.execute(data.ci, data.password);

            res.json({
                success: true,
                message: 'Inicio de sesión exitoso',
                data: {
                    user: toDTO(result.user),
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
                data: toDTO(user)
            });
        } catch (error) {
            next(error);
        }
    };
}
