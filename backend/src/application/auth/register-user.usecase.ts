
import { UserRepository } from '../../domain/user/user.repository';
import { PasswordEncoder, TokenProvider } from '../../domain/auth/auth.ports';
import { User } from '../../domain/user/user.entity';

interface RegisterDto {
    ci: string;
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
    // Default role/entity logic usually in use case or default param
}

interface RegisterResult {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export class RegisterUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordEncoder: PasswordEncoder,
        private readonly tokenProvider: TokenProvider
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
        // NOTE: In a strictly pure domain, we might factory this. 
        // For simplicity, we prepare data for repo.
        // We need default Role and Entity IDs (assuming defaults exist or passed)
        // Hardcoding defaults for "Participante" (3) and "CNC" (1) for MVP
        // In real app, these should be config/constants.

        const newUser: User = {
            id: 0, // database will assign
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
