
import { injectable, inject } from 'tsyringe';
import { TokenProvider, AuthTokens } from '../../../domain/auth/auth.ports';

@injectable()
export class RefreshTokenUseCase {
    constructor(
        @inject('TokenProvider') private readonly tokenProvider: TokenProvider
    ) { }

    async execute(refreshToken: string): Promise<AuthTokens> {
        try {
            const payload = this.tokenProvider.verifyRefresh(refreshToken);
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
