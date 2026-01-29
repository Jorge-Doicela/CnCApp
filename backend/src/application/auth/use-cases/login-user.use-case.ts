import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/user.repository';
import { PasswordEncoder, TokenProvider } from '../../../domain/auth/auth.ports';
import { User } from '../../../domain/user/user.entity';
import { AuthenticationError } from '../../../domain/shared/errors';

interface LoginResult {
    user: User;
    accessToken: string;
    refreshToken: string;
}

@injectable()
export class LoginUserUseCase {
    constructor(
        @inject('UserRepository') private readonly userRepository: UserRepository,
        @inject('PasswordEncoder') private readonly passwordEncoder: PasswordEncoder,
        @inject('TokenProvider') private readonly tokenProvider: TokenProvider
    ) { }

    async execute(ci: string, password: string): Promise<LoginResult> {
        console.log(`[LOGIN_DEBUG] Iniciando intento de login para CI: "${ci}"`);
        const user = await this.userRepository.findByCi(ci);
        if (!user) {
            console.log(`[LOGIN_DEBUG] Usuario NO encontrado para CI: "${ci}"`);
            throw new AuthenticationError('Credenciales inválidas');
        }

        console.log(`[LOGIN_DEBUG] Usuario encontrado: ID=${user.id}, Nombre="${user.nombre}"`);

        if (!user.password && password) {
            console.log(`[LOGIN_DEBUG] Usuario no tiene contraseña establecida.`);
            throw new AuthenticationError('Credenciales inválidas');
        }

        if (user.password) {
            const isValid = await this.passwordEncoder.verify(password, user.password);
            if (!isValid) {
                console.log(`[LOGIN_DEBUG] Contraseña incorrecta para usuario ID=${user.id}`);
                throw new AuthenticationError('Credenciales inválidas');
            }
        }

        console.log(`[LOGIN_DEBUG] Login exitoso para usuario ID=${user.id}. Generando tokens...`);

        const tokens = this.tokenProvider.generateTokens({
            userId: user.id,
            ci: user.ci,
            roleId: user.rolId
        });

        return {
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    }
}
