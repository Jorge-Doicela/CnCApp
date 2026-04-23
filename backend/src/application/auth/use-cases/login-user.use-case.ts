import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/user.repository';
import { PasswordEncoder, TokenProvider } from '../../../domain/auth/auth.ports';
import { User } from '../../../domain/user/entities/user.entity';
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

    async execute(identifier: string, password?: string, biometricToken?: string): Promise<LoginResult> {
        const isEmail = identifier.includes('@');
        
        const user = isEmail 
            ? await this.userRepository.findByEmail(identifier)
            : await this.userRepository.findByCi(identifier);

        if (!user) {
            throw new AuthenticationError('Credenciales inválidas');
        }


        // LOGIN POR TOKEN BIOMÉTRICO (Nivel 2)
        if (biometricToken) {
            if (!user.biometricToken || user.biometricToken !== biometricToken) {
                throw new AuthenticationError('Sesión biométrica expirada o no configurada. Por favor, use su contraseña.');
            }
        } 
        // LOGIN POR CONTRASEÑA (Normal / Primera vez)
        else if (password) {
            if (!user.password) {
                throw new AuthenticationError('Credenciales inválidas');
            }

            const isValid = await this.passwordEncoder.verify(password, user.password);
            if (!isValid) {
                throw new AuthenticationError('Credenciales inválidas');
            }
        } else {
            throw new AuthenticationError('Debe proporcionar una contraseña o un token válido');
        }

        if (user.estado === 0) {
            throw new AuthenticationError('Su cuenta se encuentra inactiva o bloqueada. Contacte al administrador.');
        }

        if (user.estado === 2) {
            throw new AuthenticationError('Debes verificar tu correo electrónico antes de poder iniciar sesión.');
        }


        const tokens = this.tokenProvider.generateTokens({
            userId: user.id,
            ci: user.ci,
            roleId: user.rolId ?? 0,
            roleName: user.rol?.nombre || 'Usuario'
        });

        return {
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    }
}
