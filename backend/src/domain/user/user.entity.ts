
export interface User {
    id: number;
    ci: string;
    nombre: string; // Keep for backward compat or derived
    primerNombre?: string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    email: string;
    telefono?: string;
    celular?: string;
    password?: string;
    genero?: string;
    etnia?: string;
    nacionalidad?: string;
    fechaNacimiento?: Date;
    provinciaId?: number;
    cantonId?: number;
    // Relations (simplified for Domain)
    rolId: number;
    rol?: Role;
    entidadId: number;
    entidad?: Entity;
}

export interface Role {
    id: number;
    nombre: string;
    modulos?: string[] | string; // Can be stringified JSON or array
}

export interface Entity {
    id: number;
    nombre: string;
}
