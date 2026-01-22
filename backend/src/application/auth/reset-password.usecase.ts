
import { UserRepository } from '../../domain/user/user.repository';
import { TokenProvider, PasswordEncoder } from '../../domain/auth/auth.ports';

export class ResetPasswordUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tokenProvider: TokenProvider,
        private readonly passwordEncoder: PasswordEncoder
    ) { }

    async execute(token: string, newPassword: string): Promise<void> {
        // 1. Verify reset token
        const payload = this.tokenProvider.verifyReset(token);

        // 2. Find user
        const user = await this.userRepository.findById(payload.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // 3. Hash new password
        const hashedPassword = await this.passwordEncoder.hash(newPassword);

        // 4. Update user
        await this.userRepository.update(user.id, { password: hashedPassword });

        console.log(`[AUTH] Password reset successful for user ID: ${user.id}`);
    }
}
