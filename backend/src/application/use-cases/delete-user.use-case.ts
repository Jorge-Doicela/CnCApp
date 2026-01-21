import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../domain/repositories/user.repository';
import { NotFoundError } from '../../domain/errors';

@injectable()
export class DeleteUserUseCase {
    constructor(
        @inject('UserRepository') private userRepository: UserRepository
    ) { }

    async execute(id: number): Promise<void> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        await this.userRepository.delete(id);
    }
}
