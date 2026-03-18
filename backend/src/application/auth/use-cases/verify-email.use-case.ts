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
            const payload = await this.tokenProvider.verify(token);
            if (!payload || typeof payload !== 'object' || !payload.userId) {
                return false;
            }

            const user = await this.userRepository.findById(payload.userId);
            if (!user) {
                return false;
            }

            // Si ya está activo, retornamos éxito
            if (user.estado === 1) {
                return true;
            }

            // Activar la cuenta si está en estado pendiente de verificación (2)
            if (user.estado === 2) {
                user.estado = 1;
                await this.userRepository.save(user);
                return true;
            }

            return false; // Otro estado bloqueado
        } catch (error) {
            console.error('[VERIFY_EMAIL] Token inválido o expirado:', error);
            return false;
        }
    }
}
