import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/user.repository';
import { PasswordEncoder, TokenProvider } from '../../../domain/auth/auth.ports';
import { User } from '../../../domain/user/user.entity';
import { ValidationError } from '../../../domain/shared/errors';

interface RegisterDto {
    ci: string;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    email: string;
    password: string;
    telefono?: string;
    celular?: string;
    genero?: string;
    etnia?: string;
    nacionalidad?: string;
    fechaNacimiento?: string; // ISO string
    provinciaId?: number;
    cantonId?: number;
    tipoParticipante?: number;
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
            throw new ValidationError('Ya existe un usuario con esta Cédula');
        }

        // 2. Check if Email exists
        const existingUserByEmail = await this.userRepository.findByEmail(data.email);
        if (existingUserByEmail) {
            throw new ValidationError('Ya existe un usuario con este Email');
        }

        // 3. Hash password
        const hashedPassword = await this.passwordEncoder.hash(data.password);

        // 3. Create User Entity
        const nombreCompleto = `${data.primerNombre} ${data.segundoNombre || ''} ${data.primerApellido} ${data.segundoApellido || ''}`.replace(/\s+/g, ' ').trim();

        const newUser: User = {
            id: 0,
            ci: data.ci,
            nombre: nombreCompleto,
            primerNombre: data.primerNombre,
            segundoNombre: data.segundoNombre,
            primerApellido: data.primerApellido,
            segundoApellido: data.segundoApellido,
            email: data.email,
            telefono: data.telefono,
            celular: data.celular,
            password: hashedPassword,
            genero: data.genero,
            etnia: data.etnia,
            nacionalidad: data.nacionalidad,
            fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
            provinciaId: data.provinciaId,
            cantonId: data.cantonId,
            rolId: 3, // Usuario (rol por defecto para nuevos registros)
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
