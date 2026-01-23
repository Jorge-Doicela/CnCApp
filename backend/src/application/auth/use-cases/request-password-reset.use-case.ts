
import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/user.repository';
import { TokenProvider } from '../../../domain/auth/auth.ports';

@injectable()
export class RequestPasswordResetUseCase {
    constructor(
        @inject('UserRepository') private readonly userRepository: UserRepository,
        @inject('TokenProvider') private readonly tokenProvider: TokenProvider
    ) { }

    async execute(email: string, redirectTo: string): Promise<void> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            console.log(`[AUTH] Password reset requested for non-existent email: ${email}`);
            return;
        }

        const tokens = this.tokenProvider.generateTokens({
            userId: user.id,
            ci: user.ci,
            roleId: user.rolId
        });

        const resetToken = tokens.accessToken;

        console.log('--------------------------------------------------');
        console.log(`[EMAIL MOCK] To: ${email}`);
        console.log(`[EMAIL MOCK] Subject: Recuperación de Contraseña - CNC`);
        console.log(`[EMAIL MOCK] Click here to reset: ${redirectTo}?type=recovery&token=${resetToken}`);
        console.log('--------------------------------------------------');
    }
}
