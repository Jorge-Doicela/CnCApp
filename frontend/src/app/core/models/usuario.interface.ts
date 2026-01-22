import { Rol } from './rol.interface';
import { Entidad } from './entidad.interface';

export interface Usuario {
    Id_Usuario: number;
    auth_uid?: string;
    Nombre_Usuario: string;
    CI_Usuario: string;
    Email_Usuario?: string;
    Telefono_Usuario?: string;
    Rol_Usuario?: number;
    Entidad_Usuario?: number;
    tipo_participante: number;
    foto_perfil_url?: string;
    firma_url?: string;
    created_at?: string;
    updated_at?: string;
    rol?: Rol;
    entidad?: Entidad;
}
