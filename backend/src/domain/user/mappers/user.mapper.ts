import { User } from '../entities/user.entity';

export class UserMapper {
    static toDomain(prismaUser: any): User {
        return {
            id: prismaUser.id,
            authUid: prismaUser.authUid,
            nombre: prismaUser.nombre,
            primerNombre: prismaUser.primerNombre,
            segundoNombre: prismaUser.segundoNombre,
            primerApellido: prismaUser.primerApellido,
            segundoApellido: prismaUser.segundoApellido,
            ci: prismaUser.ci,
            email: prismaUser.email,
            password: prismaUser.password,
            telefono: prismaUser.telefono,
            celular: prismaUser.celular,
            generoId: prismaUser.generoId,
            etniaId: prismaUser.etniaId,
            nacionalidad: prismaUser.nacionalidad,
            fechaNacimiento: prismaUser.fechaNacimiento,
            tipoParticipanteId: prismaUser.tipoParticipanteId,
            rolId: prismaUser.rolId,
            entidadId: prismaUser.entidadId,
            provinciaId: prismaUser.provinciaId,
            cantonId: prismaUser.cantonId,
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
            } : null,
            provincia: prismaUser.provincia ? {
                id: prismaUser.provincia.id,
                nombre: prismaUser.provincia.nombre
            } : null,
            canton: prismaUser.canton ? {
                id: prismaUser.canton.id,
                nombre: prismaUser.canton.nombre
            } : null,
            tipoParticipante: prismaUser.tipoParticipante ? {
                id: prismaUser.tipoParticipante.id,
                nombre: prismaUser.tipoParticipante.nombre
            } : null,
            _count: prismaUser._count ? {
                inscripciones: prismaUser._count.inscripciones,
                certificados: prismaUser._count.certificados
            } : null
        };
    }

    static toDTO(user: User): any {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
