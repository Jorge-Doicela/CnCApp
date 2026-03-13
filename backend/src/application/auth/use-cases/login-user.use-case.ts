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

    async execute(ci: string, password?: string, biometricToken?: string): Promise<LoginResult> {
        console.log(`[LOGIN_DEBUG] Iniciando intento de login para CI: "${ci}" (Modo: ${biometricToken ? 'Biométrico' : 'Password'})`);
        const user = await this.userRepository.findByCi(ci);
        if (!user) {
            console.log(`[LOGIN_DEBUG] Usuario NO encontrado para CI: "${ci}"`);
            throw new AuthenticationError('Credenciales inválidas');
        }

        console.log(`[LOGIN_DEBUG] Usuario encontrado: ID=${user.id}, Nombre="${user.nombre}"`);

        // LOGIN POR TOKEN BIOMÉTRICO (Nivel 2)
        if (biometricToken) {
            if (!user.biometricToken || user.biometricToken !== biometricToken) {
                console.log(`[LOGIN_DEBUG] Token biométrico inválido para usuario ID=${user.id}`);
                throw new AuthenticationError('Sesión biométrica expirada o no configurada. Por favor, use su contraseña.');
            }
            console.log(`[LOGIN_DEBUG] Autenticación por token biométrico exitosa para ID=${user.id}`);
        } 
        // LOGIN POR CONTRASEÑA (Normal / Primera vez)
        else if (password) {
            if (!user.password) {
                console.log(`[LOGIN_DEBUG] Usuario no tiene contraseña establecida.`);
                throw new AuthenticationError('Credenciales inválidas');
            }

            const isValid = await this.passwordEncoder.verify(password, user.password);
            if (!isValid) {
                console.log(`[LOGIN_DEBUG] Contraseña incorrecta para usuario ID=${user.id}`);
                throw new AuthenticationError('Credenciales inválidas');
            }
        } else {
            throw new AuthenticationError('Debe proporcionar una contraseña o un token válido');
        }

        // Verificación de estado de cuenta (Funcionalidad de bloqueo)
        if (user.estado === 0) {
            console.log(`[LOGIN_DEBUG] Intento de login en cuenta inactiva/bloqueada ID=${user.id}`);
            throw new AuthenticationError('Su cuenta se encuentra inactiva o bloqueada. Contacte al administrador.');
        }

        console.log(`[LOGIN_DEBUG] Login exitoso para usuario ID=${user.id}. Generando tokens...`);

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
