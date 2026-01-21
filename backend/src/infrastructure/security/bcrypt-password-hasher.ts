import { injectable } from 'tsyringe';
import bcrypt from 'bcrypt';
import { PasswordHasher } from '../../application/shared/interfaces/password-hasher.interface';

@injectable()
export class BcryptPasswordHasher implements PasswordHasher {
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
