import { injectable } from 'tsyringe';
import { User } from '../../../domain/user/entities/user.entity';

@injectable()
export class GetAllUsersUseCase {
    constructor() { }

    async execute(): Promise<User[]> {
        const { container } = require('tsyringe');
        const userRepository = container.resolve('UserRepository');
        const users = await userRepository.findAll();
        // Remove sensitive data
        return users.map((user: any) => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        });
    }
}
