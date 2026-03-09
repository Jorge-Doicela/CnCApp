import { injectable } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { TokenProvider, TokenPayload, AuthTokens } from '../../domain/auth/auth.ports';
import { env } from '../../config/env';

@injectable()
export class JwtTokenProvider implements TokenProvider {
    private readonly ACCESS_SECRET = env.JWT_SECRET;
    private readonly REFRESH_SECRET = env.JWT_REFRESH_SECRET;
    private readonly ACCESS_EXPIRES = env.JWT_EXPIRES_IN;
    private readonly REFRESH_EXPIRES = env.JWT_REFRESH_EXPIRES_IN;

    generateTokens(payload: TokenPayload): AuthTokens {
        const accessToken = jwt.sign(
            { userId: payload.userId, ci: payload.ci, roleId: payload.roleId, roleName: payload.roleName },
            this.ACCESS_SECRET,
            { expiresIn: this.ACCESS_EXPIRES as any }
        );

        const refreshToken = jwt.sign(
            { userId: payload.userId, ci: payload.ci, roleId: payload.roleId, roleName: payload.roleName },
            this.REFRESH_SECRET,
            { expiresIn: this.REFRESH_EXPIRES as any }
        );

        return { accessToken, refreshToken };
    }

    verify(token: string): TokenPayload {
        const decoded = jwt.verify(token, this.ACCESS_SECRET) as any;
        return {
            userId: decoded.userId,
            ci: decoded.ci,
            roleId: decoded.roleId,
            roleName: decoded.roleName
        };
    }

    verifyRefresh(token: string): TokenPayload {
        const decoded = jwt.verify(token, this.REFRESH_SECRET) as any;
        return {
            userId: decoded.userId,
            ci: decoded.ci,
            roleId: decoded.roleId,
            roleName: decoded.roleName
        };
    }

    verifyReset(token: string): TokenPayload {
        const decoded = jwt.verify(token, this.ACCESS_SECRET) as any;
        return {
            userId: decoded.userId,
            ci: decoded.ci,
            roleId: decoded.roleId,
            roleName: decoded.roleName
        };
    }
}
