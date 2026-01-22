
export interface User {
    id: number;
    ci: string;
    nombre: string;
    email: string;
    telefono?: string;
    password?: string;
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
