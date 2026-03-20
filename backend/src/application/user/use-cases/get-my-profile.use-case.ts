import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/user.repository';
import { NotFoundError } from '../../../domain/shared/errors';
import { User } from '../../../domain/user/entities/user.entity';

@injectable()
export class GetMyProfileUseCase {
    constructor(
        @inject('UserRepository') private userRepository: UserRepository
    ) { }

    async execute(id: number): Promise<Partial<User>> {
        const user = await this.userRepository.findProfileById(id);

        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
