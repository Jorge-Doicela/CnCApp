
import bcrypt from 'bcrypt';
import { PasswordEncoder } from '../../domain/auth/auth.ports';

export class BcryptPasswordEncoder implements PasswordEncoder {
    private readonly SALT_ROUNDS = 10;

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    async verify(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }
}
