import { injectable, inject } from 'tsyringe';
import { User } from '../../../domain/user/entities/user.entity';
import { UserRepository } from '../../../domain/user/repositories/user.repository';
import { NotFoundError } from '../../../domain/shared/errors';
import { PasswordEncoder } from '../../../domain/auth/auth.ports';

@injectable()
export class UpdateUserUseCase {
    constructor(
        @inject('UserRepository') private userRepository: UserRepository,
        @inject('PasswordEncoder') private passwordEncoder: PasswordEncoder
    ) { }

    async execute(id: number, userData: Partial<User>): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        // If password is provided, hash it
        if (userData.password) {
            userData.password = await this.passwordEncoder.hash(userData.password);
        }

        const updatedUser = await this.userRepository.update(id, userData);
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword as User;
    }
}
