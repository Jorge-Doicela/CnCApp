
import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/user.repository';
import { PasswordEncoder, TokenProvider } from '../../../domain/auth/auth.ports';
import { User } from '../../../domain/user/user.entity';

interface RegisterDto {
    ci: string;
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
}

interface RegisterResult {
    user: User;
    accessToken: string;
    refreshToken: string;
}

@injectable()
export class RegisterUserUseCase {
    constructor(
        @inject('UserRepository') private readonly userRepository: UserRepository,
        @inject('PasswordEncoder') private readonly passwordEncoder: PasswordEncoder,
        @inject('TokenProvider') private readonly tokenProvider: TokenProvider
    ) { }

    async execute(data: RegisterDto): Promise<RegisterResult> {
        // 1. Check if CI exists
        const existingUserByCi = await this.userRepository.findByCi(data.ci);
        if (existingUserByCi) {
            throw new Error('User with this CI already exists');
        }

        // 2. Check if Email exists
        const existingUserByEmail = await this.userRepository.findByEmail(data.email);
        if (existingUserByEmail) {
            throw new Error('User with this Email already exists');
        }

        // 3. Hash password
        const hashedPassword = await this.passwordEncoder.hash(data.password);

        // 3. Create User Entity
        const newUser: User = {
            id: 0,
            ci: data.ci,
            nombre: data.nombre,
            email: data.email,
            telefono: data.telefono,
            password: hashedPassword,
            rolId: 3, // Participante
            entidadId: 1 // CNC
        };

        const savedUser = await this.userRepository.save(newUser);

        // 4. Generate tokens
        const tokens = this.tokenProvider.generateTokens({
            userId: savedUser.id,
            ci: savedUser.ci,
            roleId: savedUser.rolId
        });

        return {
            user: savedUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    }
}
