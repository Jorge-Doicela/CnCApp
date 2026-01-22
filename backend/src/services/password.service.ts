import bcrypt from 'bcrypt';

/**
 * Password Service
 * Handles password hashing and verification using bcrypt
 */

const SALT_ROUNDS = 10;

export class PasswordService {
    /**
     * Hash a plain text password
     */
    static async hash(password: string): Promise<string> {
        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    /**
     * Verify a password against a hash
     */
    static async verify(password: string, hash: string): Promise<boolean> {
        if (!password || !hash) {
            return false;
        }

        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            console.error('[PASSWORD_SERVICE] Verification error:', error);
            return false;
        }
    }
}
