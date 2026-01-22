
import { PrismaUserRepository } from '../database/prisma-user.repository';
import { BcryptPasswordEncoder } from '../security/bcrypt-password.encoder';
import { JwtTokenProvider } from '../security/jwt-token.provider';
import { LoginUserUseCase } from '../../application/auth/login-user.usecase';
import { RegisterUserUseCase } from '../../application/auth/register-user.usecase';
import { RefreshTokenUseCase } from '../../application/auth/refresh-token.usecase';

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
