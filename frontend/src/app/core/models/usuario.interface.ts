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
    fotoPerfilUrl?: string;
    firmaUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    rol?: Rol;
    entidad?: Entidad;
}
