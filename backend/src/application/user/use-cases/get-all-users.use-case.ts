import { injectable, inject } from 'tsyringe';
import { User } from '../../../domain/user/entities/user.entity';
import { UserRepository } from '../../../domain/user/user.repository';

@injectable()
export class GetAllUsersUseCase {
    constructor(
        @inject('UserRepository') private userRepository: UserRepository
    ) { }

    async execute(): Promise<User[]> {
        const users = await this.userRepository.findAll();
        // Remove sensitive data
        return users.map((user: any) => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        });
    }
}
