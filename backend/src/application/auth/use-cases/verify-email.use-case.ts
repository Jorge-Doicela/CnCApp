import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/user.repository';
import { TokenProvider } from '../../../domain/auth/auth.ports';

@injectable()
export class VerifyEmailUseCase {
    constructor(
        @inject('UserRepository') private readonly userRepository: UserRepository,
        @inject('TokenProvider') private readonly tokenProvider: TokenProvider
    ) { }

    async execute(token: string): Promise<boolean> {
        try {
            if (!token) return false;

            // Buscamos al usuario que tenga este token de activación
            const user = await this.userRepository.findByBiometricToken(token);
            
            if (!user) {
                console.error('[VERIFY_EMAIL] No se encontró usuario con el token proporcionado');
                return false;
            }

            // Si ya está activo, retornamos éxito
            if (user.estado === 1) {
                return true;
            }

            // Activar la cuenta si está en estado pendiente de verificación (2)
            if (user.estado === 2) {
                user.estado = 1;
                user.biometricToken = null; // Limpiar el token tras la verificación
                await this.userRepository.save(user);
                console.log(`[VERIFY_EMAIL] Usuario ${user.email} activado exitosamente`);
                return true;
            }

            return false;
        } catch (error) {
            console.error('[VERIFY_EMAIL] Error durante la verificación:', error);
            return false;
        }
    }
}
