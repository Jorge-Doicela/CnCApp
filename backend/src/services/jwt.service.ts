import jwt from 'jsonwebtoken';

/**
 * JWT Service
 * Handles token generation and verification
 */

export interface JWTPayload {
    userId: number;
    ci: string;
    roleId: number;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class JWTService {
    private static readonly SECRET = process.env.JWT_SECRET || 'cnc-jwt-secret-key-development-mode-only';
    private static readonly ACCESS_TOKEN_EXPIRES = '15m';
    private static readonly REFRESH_TOKEN_EXPIRES = '7d';

    /**
     * Generate access and refresh tokens
     */
    static generateTokens(payload: JWTPayload): TokenPair {
        const accessToken = jwt.sign(payload, this.SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRES,
        });

        const refreshToken = jwt.sign(payload, this.SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRES,
        });

        return { accessToken, refreshToken };
    }

    /**
     * Verify and decode a token
     */
    static verify(token: string): JWTPayload {
        try {
            return jwt.verify(token, this.SECRET) as JWTPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Decode token without verification (for debugging)
     */
    static decode(token: string): JWTPayload | null {
        try {
            return jwt.decode(token) as JWTPayload;
        } catch {
            return null;
        }
    }
}
