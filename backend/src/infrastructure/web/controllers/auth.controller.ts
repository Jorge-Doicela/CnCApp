import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { z } from 'zod';
import { validarCedula } from '../../../domain/shared/utils/validar-cedula';
import { RegisterUserUseCase } from '../../../application/auth/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../../application/auth/use-cases/login-user.use-case';
import { GetUserProfileUseCase } from '../../../application/user/use-cases/get-user-profile.use-case';
import { RequestPasswordResetUseCase } from '../../../application/auth/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../../../application/auth/use-cases/reset-password.use-case';
import { RefreshTokenUseCase } from '../../../application/auth/use-cases/refresh-token.use-case';
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
    ci: z.string().length(10, 'La cédula debe tener 10 dígitos').refine(validarCedula, 'Cédula ecuatoriana inválida'),
    email: z.string().email('Email inválido'),
    telefono: z.string().optional(),
    celular: z.string().optional(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    tipoParticipanteId: z.number().int().optional(),
    provinciaId: z.number().optional(),
    cantonId: z.number().optional(),
    generoId: z.number().optional(),
    etniaId: z.number().optional(),
    nacionalidadId: z.number().optional(),
    autoridad: z.any().optional(),
    funcionarioGad: z.any().optional(),
    institucion: z.any().optional()
});

const loginSchema = z.object({
    ci: z.string().length(10, 'La cédula debe tener 10 dígitos').refine(validarCedula, 'Cédula ecuatoriana inválida'),
    password: z.string().min(1, 'La contraseña es requerida')
});

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token es requerido')
});

const requestResetSchema = z.object({
    email: z.string().email('Email inválido'),
    redirectTo: z.string()
});

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
});

@injectable()
export class AuthController {
    constructor(
        @inject(RegisterUserUseCase) private registerUseCase: RegisterUserUseCase,
        @inject(LoginUserUseCase) private loginUseCase: LoginUserUseCase,
        @inject(GetUserProfileUseCase) private getProfileUseCase: GetUserProfileUseCase,
        @inject(RequestPasswordResetUseCase) private requestPasswordResetUseCase: RequestPasswordResetUseCase,
        @inject(ResetPasswordUseCase) private resetPasswordUseCase: ResetPasswordUseCase,
        @inject(RefreshTokenUseCase) private refreshTokenUseCase: RefreshTokenUseCase
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
                etniaId: data.etniaId,
                nacionalidadId: data.nacionalidadId,
                autoridad: data.autoridad,
                funcionarioGad: data.funcionarioGad,
                institucion: data.institucion
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

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = refreshTokenSchema.parse(req.body);
            const result = await this.refreshTokenUseCase.execute(data.refreshToken);

            res.json({
                success: true,
                message: 'Token renovado exitosamente',
                data: {
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

    requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = requestResetSchema.parse(req.body);
            const result = await this.requestPasswordResetUseCase.execute(data.email, data.redirectTo);
            res.json({
                success: true,
                message: 'Si el correo existe, recibirá un enlace de recuperación.',
                demoLink: result?.resetLink
            });
        } catch (error) {
            next(error);
        }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = resetPasswordSchema.parse(req.body);
            await this.resetPasswordUseCase.execute(data.token, data.password);
            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    };
}
