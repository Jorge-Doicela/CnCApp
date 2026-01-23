
import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/user.repository';
import { PasswordEncoder, TokenProvider } from '../../../domain/auth/auth.ports';
import { User } from '../../../domain/user/user.entity';

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
        const user = await this.userRepository.findByCi(ci);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.password && password) {
            throw new Error('Invalid credentials');
        }

        if (user.password) {
            const isValid = await this.passwordEncoder.verify(password, user.password);
            if (!isValid) {
                throw new Error('Invalid credentials');
            }
        }

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
