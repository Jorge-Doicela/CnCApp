export interface Rol {
    id: number;
    nombre: string;
    codigo?: string;
    descripcion?: string;
    modulos?: any; // JSON
    createdAt?: string;
    updatedAt?: string;
}
