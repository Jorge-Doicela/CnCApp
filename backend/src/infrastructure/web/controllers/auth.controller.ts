import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../../application/use-cases/login-user.use-case';
import { GetUserProfileUseCase } from '../../../application/use-cases/get-user-profile.use-case';
import { PrismaUserRepository } from '../../database/repositories/prisma-user.repository';
import { BcryptPasswordHasher } from '../../security/bcrypt-password-hasher';
import { JwtTokenProvider } from '../../security/jwt-token-provider';
import { AuthRequest } from '../middleware/auth.middleware';

// Initialize dependencies
// In a proper DI setup these would be injected
const userRepository = new PrismaUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenProvider = new JwtTokenProvider();

const registerUseCase = new RegisterUserUseCase(userRepository, passwordHasher, tokenProvider);
const loginUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenProvider);
const getProfileUseCase = new GetUserProfileUseCase(userRepository);

// Schemas
const registerSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    ci: z.string().length(10, 'La cédula debe tener 10 dígitos'),
    email: z.string().email('Email inválido').optional(),
    telefono: z.string().optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    tipoParticipante: z.number().int().min(0).max(3).optional()
});

const loginSchema = z.object({
    ci: z.string().length(10, 'La cédula debe tener 10 dígitos'),
    password: z.string().min(1, 'La contraseña es requerida')
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = registerSchema.parse(req.body);
        const result = await registerUseCase.execute(data);
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = loginSchema.parse(req.body);
        const result = await loginUseCase.execute(data);
        res.json({
            message: 'Inicio de sesión exitoso',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }
        const user = await getProfileUseCase.execute(req.userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
};
