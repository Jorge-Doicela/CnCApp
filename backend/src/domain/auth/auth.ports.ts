
export interface TokenPayload {
    userId: number;
    ci: string;
    roleId: number;
    roleName: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface TokenProvider {
    generateTokens(payload: TokenPayload): AuthTokens;
    verify(token: string): TokenPayload;
    verifyRefresh(token: string): TokenPayload;
    verifyReset(token: string): TokenPayload;
}

export interface PasswordEncoder {
    hash(password: string): Promise<string>;
    verify(plain: string, hashed: string): Promise<boolean>;
}
