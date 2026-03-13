import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/user.repository';
import { AuthenticationError } from '../../../domain/shared/errors';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class StoreBiometricTokenUseCase {
    constructor(
        @inject('UserRepository') private readonly userRepository: UserRepository
    ) { }

    async execute(userId: number): Promise<string> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AuthenticationError('Usuario no encontrado');
        }

        // Generamos un token aleatorio fuerte (UUID v4)
        const biometricToken = uuidv4();
        
        // Lo guardamos en el usuario
        user.biometricToken = biometricToken;
        await this.userRepository.save(user);

        return biometricToken;
    }
}
