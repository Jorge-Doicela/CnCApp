import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/repositories/user.repository';
import { User } from '../../../domain/user/entities/user.entity';

@injectable()
export class GetAllUsersUseCase {
    constructor(
        @inject('UserRepository') private userRepository: UserRepository
    ) { }

    async execute(): Promise<User[]> {
        const users = await this.userRepository.findAll();
        // Remove sensitive data
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        });
    }
}
