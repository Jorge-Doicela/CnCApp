import { UserRepository } from '../../domain/repositories/user.repository';
import { NotFoundError } from '../../domain/errors';

export class GetUserProfileUseCase {
    constructor(private userRepository: UserRepository) { }

    async execute(userId: number) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
