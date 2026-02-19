import { User } from './entities/user.entity';

export interface UserRepository {
    findByCi(ci: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    findAll(): Promise<User[]>;
    save(user: User): Promise<User>;
    update(id: number, user: Partial<User>): Promise<User>;
    delete(id: number): Promise<void>;
}
