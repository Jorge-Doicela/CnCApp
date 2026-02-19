export interface Entidad {
    id: number;
    nombre: string;
    estado?: boolean;
    imagen?: string;
}

export interface EntidadRepository {
    findAll(): Promise<Entidad[]>;
    findById(id: number): Promise<Entidad | null>;
    create(entidad: Omit<Entidad, 'id'>): Promise<Entidad>;
    update(id: number, entidad: Partial<Entidad>): Promise<Entidad>;
    delete(id: number): Promise<void>;
}
