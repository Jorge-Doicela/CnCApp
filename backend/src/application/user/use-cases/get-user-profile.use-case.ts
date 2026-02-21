import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/user.repository';
import { NotFoundError } from '../../../domain/shared/errors';
import { User } from '../../../domain/user/entities/user.entity';

@injectable()
export class GetUserProfileUseCase {
    constructor(
        @inject('UserRepository') private userRepository: UserRepository
    ) { }

    async execute(identifier: string | number): Promise<Partial<User>> {
        let user: User | null;

        if (typeof identifier === 'number') {
            user = await this.userRepository.findById(identifier);
        } else {
            user = await this.userRepository.findByAuthUid(identifier);
        }

        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
