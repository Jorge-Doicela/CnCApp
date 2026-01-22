
import { UserRepository } from '../../domain/user/user.repository';
import { PasswordEncoder, TokenProvider } from '../../domain/auth/auth.ports';
import { User } from '../../domain/user/user.entity';

interface LoginResult {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export class LoginUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordEncoder: PasswordEncoder,
        private readonly tokenProvider: TokenProvider
    ) { }

    async execute(ci: string, password: string): Promise<LoginResult> {
        // 1. Find user
        const user = await this.userRepository.findByCi(ci);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // 2. Verify password (if user has one - legacy users might not?)
        // Assuming secure system, all users have passwords.
        if (!user.password && password) {
            throw new Error('Invalid credentials');
        }

        if (user.password) {
            const isValid = await this.passwordEncoder.verify(password, user.password);
            if (!isValid) {
                throw new Error('Invalid credentials');
            }
        }

        // 3. Generate tokens
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
