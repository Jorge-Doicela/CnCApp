import { User } from '../entities/user.entity';

export class UserMapper {
    static toDomain(prismaUser: any): User {
        return {
            id: prismaUser.id,
            authUid: prismaUser.authUid,
            nombre: prismaUser.nombre,
            ci: prismaUser.ci,
            email: prismaUser.email,
            password: prismaUser.password, // Required for internal Auth logic
            telefono: prismaUser.telefono,
            tipoParticipante: prismaUser.tipoParticipante,
            rolId: prismaUser.rolId,
            entidadId: prismaUser.entidadId,
            fotoPerfilUrl: prismaUser.fotoPerfilUrl,
            firmaUrl: prismaUser.firmaUrl,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
            rol: prismaUser.rol ? {
                id: prismaUser.rol.id,
                nombre: prismaUser.rol.nombre,
                modulos: prismaUser.rol.modulos
            } : null,
            entidad: prismaUser.entidad ? {
                id: prismaUser.entidad.id,
                nombre: prismaUser.entidad.nombre
            } : null
        };
    }

    static toDTO(user: User): any {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
