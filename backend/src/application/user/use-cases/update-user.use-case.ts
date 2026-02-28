import { injectable, inject } from 'tsyringe';
import { User } from '../../../domain/user/entities/user.entity';
import { UserRepository } from '../../../domain/user/repositories/user.repository';
import { NotFoundError } from '../../../domain/shared/errors';
import { PasswordEncoder } from '../../../domain/auth/auth.ports';

@injectable()
export class UpdateUserUseCase {
    constructor(
        @inject('UserRepository') private userRepository: UserRepository,
        @inject('PasswordEncoder') private passwordEncoder: PasswordEncoder
    ) { }

    async execute(id: number, userData: Partial<User>): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        // If any name field is updated, reconstruct the full name
        if (userData.primerNombre || userData.segundoNombre || userData.primerApellido || userData.segundoApellido) {
            const primerNombre = userData.primerNombre !== undefined ? userData.primerNombre : (user.primerNombre || '');
            const segundoNombre = userData.segundoNombre !== undefined ? userData.segundoNombre : (user.segundoNombre || '');
            const primerApellido = userData.primerApellido !== undefined ? userData.primerApellido : (user.primerApellido || '');
            const segundoApellido = userData.segundoApellido !== undefined ? userData.segundoApellido : (user.segundoApellido || '');

            userData.nombre = `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.replace(/\s+/g, ' ').trim();
        }

        // If password is provided, hash it
        if (userData.password) {
            userData.password = await this.passwordEncoder.hash(userData.password);
        }

        const updatedUser = await this.userRepository.update(id, userData);
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword as User;
    }
}
