import { User } from '../entities/user.entity';
import { env } from '../../../config/env';

export class UserMapper {
    static toDomain(prismaUser: any): User {
        const baseUrl = env.BASE_URL.endsWith('/') ? env.BASE_URL.slice(0, -1) : env.BASE_URL;

        const resolveUrl = (url: string | null | undefined) => {
            if (!url) return url;
            if (url.startsWith('http') || url.startsWith('data:')) return url;
            return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
        };

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
            nacionalidadId: prismaUser.nacionalidadId,
            fechaNacimiento: prismaUser.fechaNacimiento,
            tipoParticipanteId: prismaUser.tipoParticipanteId,
            rolId: prismaUser.rolId,
            entidadId: prismaUser.entidadId,
            provinciaId: prismaUser.provinciaId,
            cantonId: prismaUser.cantonId,
            parroquiaId: prismaUser.parroquiaId,
            gadParroquiaId: prismaUser.gadParroquiaId,
            estado: prismaUser.estado ?? 1,
            fotoPerfilUrl: resolveUrl(prismaUser.fotoPerfilUrl),
            firmaUrl: resolveUrl(prismaUser.firmaUrl),
            biometricToken: prismaUser.biometricToken,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
            rol: prismaUser.rol ? {
                id: prismaUser.rol.id,
                nombre: prismaUser.rol.nombre,
                codigo: prismaUser.rol.codigo,
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
            parroquia: prismaUser.parroquia ? {
                id: prismaUser.parroquia.id,
                nombre: prismaUser.parroquia.nombre
            } : null,
            gadParroquia: prismaUser.gadParroquia ? {
                id: prismaUser.gadParroquia.id,
                nombre: prismaUser.gadParroquia.nombre
            } : null,
            tipoParticipante: prismaUser.tipoParticipante ? {
                id: prismaUser.tipoParticipante.id,
                nombre: prismaUser.tipoParticipante.nombre
            } : null,
            genero: prismaUser.genero ? {
                id: prismaUser.genero.id,
                nombre: prismaUser.genero.nombre
            } : null,
            etnia: prismaUser.etnia ? {
                id: prismaUser.etnia.id,
                nombre: prismaUser.etnia.nombre
            } : null,
            nacionalidad: prismaUser.nacionalidad ? {
                id: prismaUser.nacionalidad.id,
                nombre: prismaUser.nacionalidad.nombre
            } : null,
            _count: prismaUser._count ? {
                inscripciones: prismaUser._count.inscripciones,
                certificados: prismaUser._count.certificados
            } : null,
            autoridad: prismaUser.autoridades && prismaUser.autoridades.length > 0 ? {
                id: prismaUser.autoridades[0].id,
                cargo: prismaUser.autoridades[0].cargo,
                gadAutoridad: prismaUser.autoridades[0].entidad,
                nivelGobierno: prismaUser.autoridades[0].nivelGobierno
            } : null,
            funcionarioGad: prismaUser.funcionarios && prismaUser.funcionarios.length > 0 ? {
                id: prismaUser.funcionarios[0].id,
                cargo: prismaUser.funcionarios[0].cargo,
                gadFuncionarioGad: prismaUser.funcionarios[0].departamento,
                nivelGobierno: prismaUser.funcionarios[0].nivelGobierno,
                competencias: prismaUser.funcionarios[0].competencias ? prismaUser.funcionarios[0].competencias.map((c: any) => c.id) : []
            } : null,
            institucion: prismaUser.instituciones && prismaUser.instituciones.length > 0 ? {
                id: prismaUser.instituciones[0].id,
                institucion: prismaUser.instituciones[0].institucionId,
                institucionNombre: prismaUser.instituciones[0].institucion?.nombre,
                gradoOcupacional: prismaUser.instituciones[0].gradoOcupacionalId,
                gradoOcupacionalNombre: prismaUser.instituciones[0].gradoOcupacional?.nombre
            } : null
        };
    }

    static toDTO(user: User): any {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
