import { injectable } from 'tsyringe';
import { User } from '../../../domain/user/entities/user.entity';
import { NotFoundError } from '../../../domain/shared/errors';

@injectable()
export class UpdateUserUseCase {
    constructor() { }

    async execute(id: number, userData: Partial<User>): Promise<User> {
        const { container } = require('tsyringe');
        const userRepository = container.resolve('UserRepository');
        const user = await userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        const updatedUser = await userRepository.update(id, userData);
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword as User;
    }
}
