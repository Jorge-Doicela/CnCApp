import { User } from './user.entity';

export interface UserRepository {
    findByCi(ci: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    save(user: User): Promise<User>;
    update(id: number, user: Partial<User>): Promise<User>;
}
