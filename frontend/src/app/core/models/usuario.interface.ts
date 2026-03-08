import { Rol } from './rol.interface';
import { Entidad } from './entidad.interface';

export interface Usuario {
    id: number;
    authUid?: string;
    nombre: string;
    ci: string;
    email?: string;
    telefono?: string;
    celular?: string;
    password?: string;
    rolId?: number;
    entidadId?: number;
    tipoParticipanteId?: number | null;
    fotoPerfilUrl?: string;
    firmaUrl?: string;
    primerNombre?: string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    generoId?: number | null;
    etniaId?: number | null;
    nacionalidadId?: number | null;
    fechaNacimiento?: string;
    provinciaId?: number | null;
    cantonId?: number | null;
    estado?: number;
    createdAt?: string;
    updatedAt?: string;
    convencional?: string;
    cantonReside?: string;
    parroquiaReside?: string;

    // Virtual/Mapped properties for UI
    rol?: Rol;
    entidad?: Entidad;
    tipoParticipante?: any;
    provincia?: any;
    canton?: any;
    genero?: any;
    etnia?: any;
    nacionalidad?: any;
    autoridad?: any;
    funcionarioGad?: any;
    institucion?: any;
    _count?: {
        inscripciones: number;
        certificados: number;
    };
}
