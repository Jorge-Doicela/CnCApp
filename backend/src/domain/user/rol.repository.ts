export interface Rol {
    id: number;
    nombre: string;
    descripcion?: string | null;
    modulos?: any;
    estado?: boolean; // Adding state based on frontend usage
}

export interface RolRepository {
    findAll(): Promise<Rol[]>;
    findById(id: number): Promise<Rol | null>;
    create(rol: Omit<Rol, 'id'>): Promise<Rol>;
    update(id: number, rol: Partial<Rol>): Promise<Rol>;
    delete(id: number): Promise<void>;
}
