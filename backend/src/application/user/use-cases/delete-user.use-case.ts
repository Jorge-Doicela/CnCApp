import { injectable } from 'tsyringe';
import { NotFoundError } from '../../../domain/shared/errors';

@injectable()
export class DeleteUserUseCase {
    constructor() { }

    async execute(id: number): Promise<void> {
        const { container } = require('tsyringe');
        const userRepository = container.resolve('UserRepository');
        const user = await userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        await userRepository.delete(id);
    }
}
