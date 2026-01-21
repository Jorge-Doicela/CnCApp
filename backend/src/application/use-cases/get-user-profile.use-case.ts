import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../domain/repositories/user.repository';
import { NotFoundError } from '../../domain/errors';

@injectable()
export class GetUserProfileUseCase {
    constructor(
        @inject('UserRepository') private userRepository: UserRepository
    ) { }

    async execute(userId: number) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
