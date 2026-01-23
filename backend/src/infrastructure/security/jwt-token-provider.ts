import { injectable } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { TokenProvider, TokenPayload, AuthTokens } from '../../domain/auth/auth.ports';

@injectable()
export class JwtTokenProvider implements TokenProvider {
    private readonly ACCESS_SECRET = process.env.JWT_SECRET || 'fallback_secret';
    private readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh';
    private readonly ACCESS_EXPIRES = '15m'; // or from env
    private readonly REFRESH_EXPIRES = '7d';

    generateTokens(payload: TokenPayload): AuthTokens {
        const accessToken = jwt.sign(
            { userId: payload.userId, ci: payload.ci, roleId: payload.roleId },
            this.ACCESS_SECRET,
            { expiresIn: this.ACCESS_EXPIRES }
        );

        const refreshToken = jwt.sign(
            { userId: payload.userId, ci: payload.ci, roleId: payload.roleId },
            this.REFRESH_SECRET,
            { expiresIn: this.REFRESH_EXPIRES }
        );

        return { accessToken, refreshToken };
    }

    verify(token: string): TokenPayload {
        const decoded = jwt.verify(token, this.ACCESS_SECRET) as any;
        return {
            userId: decoded.userId,
            ci: decoded.ci,
            roleId: decoded.roleId
        };
    }

    verifyRefresh(token: string): TokenPayload {
        const decoded = jwt.verify(token, this.REFRESH_SECRET) as any;
        return {
            userId: decoded.userId,
            ci: decoded.ci,
            roleId: decoded.roleId
        };
    }

    verifyReset(token: string): TokenPayload {
        const decoded = jwt.verify(token, this.ACCESS_SECRET) as any;
        return {
            userId: decoded.userId,
            ci: decoded.ci,
            roleId: decoded.roleId
        };
    }
}
