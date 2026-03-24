import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { z } from 'zod';
import { validarDocumentoIdentidad } from '../../../domain/shared/utils/validar-documento';
import { RegisterUserUseCase } from '../../../application/auth/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../../application/auth/use-cases/login-user.use-case';
import { GetUserProfileUseCase } from '../../../application/user/use-cases/get-user-profile.use-case';
import { RequestPasswordResetUseCase } from '../../../application/auth/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../../../application/auth/use-cases/reset-password.use-case';
import { RefreshTokenUseCase } from '../../../application/auth/use-cases/refresh-token.use-case';
import { StoreBiometricTokenUseCase } from '../../../application/auth/use-cases/store-biometric-token.use-case';
import { AuthRequest } from '../middleware/auth.middleware';
import { InvalidateRefreshTokenUseCase } from '../../../application/auth/use-cases/invalidate-refresh-token.use-case';
import { VerifyEmailUseCase } from '../../../application/auth/use-cases/verify-email.use-case';
import { env } from '../../../config/env';

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
    ci: z.string().min(5, 'El documento debe tener al menos 5 caracteres').max(20, 'El documento no debe exceder los 20 caracteres').refine(validarDocumentoIdentidad, 'Documento de identidad inválido o Cédula incorrecta'),
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
    institucion: z.any().optional(),
    parroquiaId: z.number().optional(),
    gadParroquiaId: z.number().int().optional(),
    estado: z.number().optional(),
    recaptchaToken: z.string().min(1, 'Token de reCAPTCHA es requerido')
});

const loginSchema = z.object({
    ci: z.string().min(5, 'El documento o email debe tener al menos 5 caracteres').max(100, 'El identificador no debe exceder los 100 caracteres').refine(validarDocumentoIdentidad, 'Documento de identidad o Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida').optional(),
    biometricToken: z.string().optional()
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
        @inject(RefreshTokenUseCase) private refreshTokenUseCase: RefreshTokenUseCase,
        @inject(StoreBiometricTokenUseCase) private storeBiometricTokenUseCase: StoreBiometricTokenUseCase,
        @inject(InvalidateRefreshTokenUseCase) private invalidateRefreshTokenUseCase: InvalidateRefreshTokenUseCase,
        @inject(VerifyEmailUseCase) private verifyEmailUseCase: VerifyEmailUseCase
    ) { }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = registerSchema.parse(req.body);

            // Verificación reCAPTCHA
            const verifyCall = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `secret=${env.RECAPTCHA_SECRET_KEY}&response=${data.recaptchaToken}`
            });
            const verifyRes = await verifyCall.json() as any;
            
            if (!verifyRes.success) {
                res.status(400).json({ success: false, message: 'Fallo verificación reCAPTCHA. Refresque e intente nuevamente.' });
                return;
            }

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
                institucion: data.institucion,
                parroquiaId: data.parroquiaId,
                gadParroquiaId: data.gadParroquiaId,
                estado: data.estado
            });

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente. Por favor, verifique su correo electrónico para activar su cuenta.',
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

            const result = await this.loginUseCase.execute(data.ci, data.password, data.biometricToken);

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

    setupBiometric = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.userId) {
                res.status(401).json({ success: false, error: 'Usuario no autenticado' });
                return;
            }
            
            const biometricToken = await this.storeBiometricTokenUseCase.execute(req.userId);

            res.json({
                success: true,
                message: 'Biometría configurada exitosamente',
                data: {
                    biometricToken
                }
            });
        } catch (error) {
            next(error);
        }
    };

    logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (req.userId) {
                await this.invalidateRefreshTokenUseCase.execute(req.userId);
            }
            res.json({
                success: true,
                message: 'Sesión cerrada exitosamente'
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

    verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.query.token as string;
            if (!token) {
                res.redirect(`${env.FRONTEND_URL}/login?verified=error`);
                return;
            }
            const success = await this.verifyEmailUseCase.execute(token);
            if (success) {
                res.redirect(`${env.FRONTEND_URL}/login?verified=true`);
            } else {
                res.redirect(`${env.FRONTEND_URL}/login?verified=error`);
            }
        } catch (error) {
            console.error('[Verify Email Controller]', error);
            res.redirect(`${env.FRONTEND_URL}/login?verified=error`);
        }
    };
}
