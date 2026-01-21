import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/repositories/user.repository';
import { User } from '../../../domain/user/entities/user.entity';
import { NotFoundError } from '../../../domain/shared/errors';

@injectable()
export class UpdateUserUseCase {
    constructor(
        @inject('UserRepository') private userRepository: UserRepository
    ) { }

    async execute(id: number, userData: Partial<User>): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        const updatedUser = await this.userRepository.update(id, userData);
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword as User;
    }
}
