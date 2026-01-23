
import { PrismaUserRepository } from '../database/prisma-user.repository';
import { BcryptPasswordEncoder } from '../security/bcrypt-password.encoder';
import { JwtTokenProvider } from '../security/jwt-token.provider';
import { LoginUserUseCase } from '../../application/auth/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../application/auth/use-cases/register-user.use-case';
import { RefreshTokenUseCase } from '../../application/auth/use-cases/refresh-token.use-case';
import { RequestPasswordResetUseCase } from '../../application/auth/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../../application/auth/use-cases/reset-password.use-case';

// Singleton instances of adapters
const userRepository = new PrismaUserRepository();
const passwordEncoder = new BcryptPasswordEncoder();
const tokenProvider = new JwtTokenProvider();

// Use Cases injection
export const loginUserUseCase = new LoginUserUseCase(
    userRepository,
    passwordEncoder,
    tokenProvider
);

export const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    passwordEncoder,
    tokenProvider
);

export const refreshTokenUseCase = new RefreshTokenUseCase(
    tokenProvider
);

export const requestPasswordResetUseCase = new RequestPasswordResetUseCase(
    userRepository,
    tokenProvider
);

export const resetPasswordUseCase = new ResetPasswordUseCase(
    userRepository,
    tokenProvider,
    passwordEncoder
);
