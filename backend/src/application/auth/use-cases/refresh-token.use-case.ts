
import { injectable, inject } from 'tsyringe';
import { TokenProvider, AuthTokens } from '../../../domain/auth/auth.ports';
import prisma from '../../../config/database';

@injectable()
export class RefreshTokenUseCase {
    constructor(
        @inject('TokenProvider') private readonly tokenProvider: TokenProvider
    ) { }

    async execute(refreshToken: string): Promise<AuthTokens> {
        try {
            const payload = this.tokenProvider.verifyRefresh(refreshToken);
            
            // Verificar que el usuario aún exista en la base de datos
            const user = await prisma.usuario.findUnique({
                where: { id: payload.userId },
                select: { id: true }
            });

            if (!user) {
                throw new Error('User no longer exists');
            }

            return this.tokenProvider.generateTokens({
                userId: payload.userId,
                ci: payload.ci,
                roleId: payload.roleId,
                roleName: payload.roleName
            });
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
}
