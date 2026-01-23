import { injectable } from 'tsyringe';
import bcrypt from 'bcrypt';
import { PasswordEncoder } from '../../domain/auth/auth.ports';

@injectable()
export class BcryptPasswordHasher implements PasswordEncoder {
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    async verify(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }
}
