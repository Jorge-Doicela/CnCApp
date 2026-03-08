import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../../../domain/user/user.repository';
import { PasswordEncoder, TokenProvider } from '../../../domain/auth/auth.ports';
import { User } from '../../../domain/user/entities/user.entity';
import { ValidationError } from '../../../domain/shared/errors';
import { RolRepository } from '../../../domain/user/rol.repository';
import { EntidadRepository } from '../../../domain/user/entidad.repository';
import prisma from '../../../config/database';

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
    generoId?: number;
    etniaId?: number;
    nacionalidadId?: number;
    fechaNacimiento?: string;
    provinciaId?: number;
    cantonId?: number;
    tipoParticipanteId?: number;
    autoridad?: any;
    funcionarioGad?: any;
    institucion?: any;
    rolId?: number;
    // captchaToken?: string; // --- GOOGLE RECAPTCHA (Descomentar en Producción) ---
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
        @inject('TokenProvider') private readonly tokenProvider: TokenProvider,
        @inject('RolRepository') private readonly rolRepository: RolRepository,
        @inject('EntidadRepository') private readonly entidadRepository: EntidadRepository
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

        /* 
        // ============================================
        // --- GOOGLE RECAPTCHA VERIFICATION (PROD) ---
        // ============================================
        // Requiere: npm install axios
        // Constante secreta desde process.env.RECAPTCHA_SECRET_KEY
        if (!data.captchaToken) {
            throw new ValidationError('Captcha requerido');
        }
        
        const axios = require('axios');
        const googleVerifyUrl = \`https://www.google.com/recaptcha/api/siteverify?secret=\${process.env.RECAPTCHA_SECRET_KEY}&response=\${data.captchaToken}\`;
        
        try {
            const googleResponse = await axios.post(googleVerifyUrl);
            if (!googleResponse.data.success) {
                throw new ValidationError('Fallo de verificación de seguridad (reCAPTCHA bot detectado).');
            }
        } catch (error) {
            throw new ValidationError('Error al comunicarse con servidores de reCAPTCHA.');
        }
        // ============================================
        */

        // 3. Hash password
        const hashedPassword = await this.passwordEncoder.hash(data.password);

        // Asignar rol dependiendo del tipo de participante dinámicamente
        let assignedRoleName = 'Usuario';
        
        if (data.tipoParticipanteId) {
            const tipo = await prisma.tipoParticipante.findUnique({
                where: { id: data.tipoParticipanteId }
            });
            if (tipo && ['Autoridad', 'Funcionario GAD', 'Institución del Sistema'].includes(tipo.nombre)) {
                assignedRoleName = 'Conferencista';
            }
        }

        let finalRolId = data.rolId;
        let finalRoleName = '';

        if (finalRolId) {
            const explicitRole = await this.rolRepository.findById(finalRolId);
            if (!explicitRole) {
                throw new ValidationError(`El rol proporcionado (ID: ${finalRolId}) no existe en el sistema.`);
            }
            finalRoleName = explicitRole.nombre;
        } else {
            const usuarioRole = await this.rolRepository.findByName(assignedRoleName);
            if (!usuarioRole) {
                throw new ValidationError(`El rol por defecto '${assignedRoleName}' no se encuentra en el sistema. Contacte al administrador.`);
            }
            finalRolId = usuarioRole.id;
            finalRoleName = usuarioRole.nombre;
        }

        const cncEntity = await this.entidadRepository.findByName('Consejo Nacional de Competencias');

        // 3. Create User Entity
        const nombreCompleto = `${data.primerNombre} ${data.segundoNombre || ''} ${data.primerApellido} ${data.segundoApellido || ''}`.replace(/\s+/g, ' ').trim();
        const now = new Date();

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
            generoId: data.generoId,
            etniaId: data.etniaId,
            nacionalidadId: data.nacionalidadId,
            fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
            provinciaId: data.provinciaId,
            cantonId: data.cantonId,
            rolId: finalRolId,
            entidadId: data.autoridad?.nivelgobierno || data.funcionarioGad?.nivelgobierno || (cncEntity ? cncEntity.id : null),
            tipoParticipanteId: data.tipoParticipanteId || null,
            createdAt: now,
            updatedAt: now,
            authUid: null,
            fotoPerfilUrl: null,
            firmaUrl: null,
            autoridad: data.autoridad,
            funcionarioGad: data.funcionarioGad,
            institucion: data.institucion
        };

        const savedUser = await this.userRepository.save(newUser);

        // 4. Generate tokens
        const tokens = this.tokenProvider.generateTokens({
            userId: savedUser.id,
            ci: savedUser.ci,
            roleId: savedUser.rolId ?? finalRolId,
            roleName: finalRoleName
        });

        return {
            user: savedUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    }
}
