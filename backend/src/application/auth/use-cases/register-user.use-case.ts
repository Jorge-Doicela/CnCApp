import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/repositories/user.repository';
import { PasswordHasher } from '../../shared/interfaces/password-hasher.interface';
import { TokenProvider } from '../../shared/interfaces/token-provider.interface';
import { RegisterUserDto, AuthResponseDto } from '../dtos/auth.dtos';
import { ValidationError } from '../../../domain/shared/errors';

@injectable()
export class RegisterUserUseCase {
    constructor(
        @inject('UserRepository') private userRepository: UserRepository,
        @inject('PasswordHasher') private passwordHasher: PasswordHasher,
        @inject('TokenProvider') private tokenProvider: TokenProvider
    ) { }

    async execute(dto: RegisterUserDto): Promise<AuthResponseDto> {
        // 1. Check if user exists
        const existingUser = await this.userRepository.findByCi(dto.ci);
        if (existingUser) {
            throw new ValidationError('La cédula ya está registrada');
        }

        // 2. Hash password
        const hashedPassword = await this.passwordHasher.hash(dto.password);

        // 3. Create user
        const newUser = await this.userRepository.create({
            ...dto,
            password: hashedPassword,
            tipoParticipante: dto.tipoParticipante ?? 0,
            rolId: dto.rolId ?? 2
        });

        // 4. Generate token
        const token = this.tokenProvider.generateToken({
            userId: newUser.id,
            userRole: newUser.rolId
        });

        // 5. Return result
        // Remove password from response
        const { password, ...userWithoutPassword } = newUser;
        return {
            user: userWithoutPassword,
            token
        };
    }
}
