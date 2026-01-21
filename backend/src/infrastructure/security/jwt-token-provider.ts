import { injectable } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { TokenProvider } from '../../application/interfaces/token-provider.interface';

@injectable()
export class JwtTokenProvider implements TokenProvider {
    private readonly secret: string;
    private readonly expiresIn: string;

    constructor() {
        this.secret = process.env.JWT_SECRET || 'secret';
        this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    }

    generateToken(payload: any): string {
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as any });
    }

    verifyToken(token: string): any {
        return jwt.verify(token, this.secret);
    }
}
