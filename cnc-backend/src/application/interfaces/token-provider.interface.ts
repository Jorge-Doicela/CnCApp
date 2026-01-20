export interface TokenProvider {
    generateToken(payload: any): string;
    verifyToken(token: string): any;
}
