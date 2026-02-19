import { injectable } from 'tsyringe';
import { NotFoundError } from '../../../domain/shared/errors';

@injectable()
export class GetUserProfileUseCase {
    constructor() { }

    async execute(userId: number) {
        const { container } = require('tsyringe');
        const userRepository = container.resolve('UserRepository');
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
