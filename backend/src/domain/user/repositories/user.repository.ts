import { User } from '../entities/user.entity';

export interface UserRepository {
    create(user: Partial<User>): Promise<User>;
    findByCi(ci: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    update(id: number, user: Partial<User>): Promise<User>;
    findByAuthUid(authUid: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    delete(id: number): Promise<void>;
}
