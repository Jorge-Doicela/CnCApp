
import { TokenProvider, AuthTokens } from '../../domain/auth/auth.ports';

export class RefreshTokenUseCase {
    constructor(
        private readonly tokenProvider: TokenProvider
    ) { }

    async execute(refreshToken: string): Promise<AuthTokens> {
        try {
            // 1. Verify refresh token
            const payload = this.tokenProvider.verifyRefresh(refreshToken);

            // 2. Generate new set of tokens
            return this.tokenProvider.generateTokens({
                userId: payload.userId,
                ci: payload.ci,
                roleId: payload.roleId
            });
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
}
