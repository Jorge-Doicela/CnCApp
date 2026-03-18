import { injectable, inject } from 'tsyringe';
import { User } from '../../../domain/user/entities/user.entity';
import { UserRepository } from '../../../domain/user/user.repository';
import { NotFoundError } from '../../../domain/shared/errors';
import { PasswordEncoder } from '../../../domain/auth/auth.ports';
import { FileStorageService } from '../../../infrastructure/services/file-storage.service';

@injectable()
export class UpdateUserUseCase {
    constructor(
        @inject('UserRepository') private userRepository: UserRepository,
        @inject('PasswordEncoder') private passwordEncoder: PasswordEncoder,
        @inject(FileStorageService) private fileStorageService: FileStorageService
    ) { }

    async execute(id: number, userData: Partial<User>): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        // Handle Image Uploads (Profile Photo)
        if (userData.fotoPerfilUrl && userData.fotoPerfilUrl.startsWith('data:image')) {
            // Delete old file if it was a local upload
            if (user.fotoPerfilUrl) {
                await this.fileStorageService.deleteFile(user.fotoPerfilUrl);
            }
            userData.fotoPerfilUrl = await this.fileStorageService.saveBase64(userData.fotoPerfilUrl, 'profiles');
        } else if (userData.fotoPerfilUrl === null || userData.fotoPerfilUrl === '') {
            // User wants to remove their photo
            if (user.fotoPerfilUrl) {
                await this.fileStorageService.deleteFile(user.fotoPerfilUrl);
            }
        }

        // Handle Image Uploads (Signature)
        if (userData.firmaUrl && userData.firmaUrl.startsWith('data:image')) {
            // Delete old file if it was a local upload
            if (user.firmaUrl) {
                await this.fileStorageService.deleteFile(user.firmaUrl);
            }
            userData.firmaUrl = await this.fileStorageService.saveBase64(userData.firmaUrl, 'signatures');
        } else if (userData.firmaUrl === null || userData.firmaUrl === '') {
            // User wants to remove their signature
            if (user.firmaUrl) {
                await this.fileStorageService.deleteFile(user.firmaUrl);
            }
        }

        // If any name field is updated, reconstruct the full name
        if ('primerNombre' in userData || 'segundoNombre' in userData || 'primerApellido' in userData || 'segundoApellido' in userData) {
            const sanitizeName = (val?: string | null) => (!val || val === 'null' || val === 'undefined') ? '' : val.trim();
            
            if ('primerNombre' in userData) userData.primerNombre = sanitizeName(userData.primerNombre) || undefined;
            if ('segundoNombre' in userData) userData.segundoNombre = sanitizeName(userData.segundoNombre) || undefined;
            if ('primerApellido' in userData) userData.primerApellido = sanitizeName(userData.primerApellido) || undefined;
            if ('segundoApellido' in userData) userData.segundoApellido = sanitizeName(userData.segundoApellido) || undefined;

            const finalPrimerNombre = userData.primerNombre !== undefined ? userData.primerNombre : (user.primerNombre || '');
            const finalSegundoNombre = userData.segundoNombre !== undefined ? userData.segundoNombre : (user.segundoNombre || '');
            const finalPrimerApellido = userData.primerApellido !== undefined ? userData.primerApellido : (user.primerApellido || '');
            const finalSegundoApellido = userData.segundoApellido !== undefined ? userData.segundoApellido : (user.segundoApellido || '');

            userData.nombre = `${finalPrimerNombre} ${finalSegundoNombre} ${finalPrimerApellido} ${finalSegundoApellido}`.replace(/\s+/g, ' ').trim();
        }

        // If password is provided, hash it
        if (userData.password) {
            userData.password = await this.passwordEncoder.hash(userData.password);
        }

        // Convert fechaNacimiento to Date if it's a string
        if (userData.fechaNacimiento && typeof userData.fechaNacimiento === 'string') {
            userData.fechaNacimiento = new Date(userData.fechaNacimiento);
        }

        const updatedUser = await this.userRepository.update(id, userData);
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword as User;
    }
}
