
import { UserRepository } from '../../domain/user/user.repository';
import { TokenProvider } from '../../domain/auth/auth.ports';

export class RequestPasswordResetUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tokenProvider: TokenProvider
    ) { }

    async execute(email: string, redirectTo: string): Promise<void> {
        // 1. Find user by email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            // We return success anyway to prevent email enumeration
            console.log(`[AUTH] Password reset requested for non-existent email: ${email}`);
            return;
        }

        // 2. Generate reset token (short-lived)
        const tokens = this.tokenProvider.generateTokens({
            userId: user.id,
            ci: user.ci,
            roleId: user.rolId
        });

        const resetToken = tokens.accessToken; // Using access token as reset token for MVP

        // 3. Mock sending email
        console.log('--------------------------------------------------');
        console.log(`[EMAIL MOCK] To: ${email}`);
        console.log(`[EMAIL MOCK] Subject: Recuperación de Contraseña - CNC`);
        console.log(`[EMAIL MOCK] Click here to reset: ${redirectTo}?type=recovery&token=${resetToken}`);
        console.log('--------------------------------------------------');
    }
}
