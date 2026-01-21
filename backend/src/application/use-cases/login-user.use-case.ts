import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasher } from '../interfaces/password-hasher.interface';
import { TokenProvider } from '../interfaces/token-provider.interface';
import { LoginUserDto, AuthResponseDto } from '../dtos/auth.dtos';
import { AuthenticationError } from '../../domain/errors';

@injectable()
export class LoginUserUseCase {
    constructor(
        @inject('UserRepository') private userRepository: UserRepository,
        @inject('PasswordHasher') private passwordHasher: PasswordHasher,
        @inject('TokenProvider') private tokenProvider: TokenProvider
    ) { }

    async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
        // 1. Find user
        const user = await this.userRepository.findByCi(dto.ci);
        if (!user) {
            throw new AuthenticationError('Cédula o contraseña incorrectos');
        }

        // 2. Verify password
        const isValidPassword = await this.passwordHasher.compare(dto.password, user.password || '');
        if (!isValidPassword) {
            throw new AuthenticationError('Cédula o contraseña incorrectos');
        }

        // 3. Generate token
        const token = this.tokenProvider.generateToken({
            userId: user.id,
            userRole: user.rolId
        });

        // 4. Return result
        const { password, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token
        };
    }
}
