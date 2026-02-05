export interface Rol {
    id: number;
    nombre: string;
    descripcion?: string | null;
}

export interface RolRepository {
    findAll(): Promise<Rol[]>;
}
