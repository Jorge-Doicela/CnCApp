import { Rol } from './rol.interface';
import { Entidad } from './entidad.interface';

export interface Usuario {
    id: number;
    authUid?: string;
    nombre: string;
    ci: string;
    email?: string;
    telefono?: string;
    rolId?: number;
    entidadId?: number;
    tipoParticipante: number;
    nombre1?: string;
    nombre2?: string;
    apellido1?: string;
    apellido2?: string;
    celular?: string;
    convencional?: string;
    genero?: string;
    etnia?: string;
    nacionalidad?: string;
    fechaNacimiento?: string;
    cantonReside?: string;
    parroquiaReside?: string;
    firmaUrl?: string;
    fotoPerfilUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    rol?: Rol;
    entidad?: Entidad;
    autoridad?: any;
    funcionarioGad?: any;
    institucion?: any;
}
