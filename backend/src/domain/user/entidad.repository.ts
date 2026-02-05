export interface Entidad {
    id: number;
    nombre: string;
}

export interface EntidadRepository {
    findAll(): Promise<Entidad[]>;
}
