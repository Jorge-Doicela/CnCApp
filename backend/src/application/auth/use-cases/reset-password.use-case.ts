
import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/user.repository';
import { TokenProvider, PasswordEncoder } from '../../../domain/auth/auth.ports';

@injectable()
export class ResetPasswordUseCase {
    constructor(
        @inject('UserRepository') private readonly userRepository: UserRepository,
        @inject('TokenProvider') private readonly tokenProvider: TokenProvider,
        @inject('PasswordEncoder') private readonly passwordEncoder: PasswordEncoder
    ) { }

    async execute(token: string, newPassword: string): Promise<void> {
        const payload = this.tokenProvider.verifyReset(token);

        const user = await this.userRepository.findById(payload.userId);
        if (!user) {
            throw new Error('User not found');
        }

        const hashedPassword = await this.passwordEncoder.hash(newPassword);

        await this.userRepository.update(user.id, { password: hashedPassword });

        console.log(`[AUTH] Password reset successful for user ID: ${user.id}`);
    }
}
