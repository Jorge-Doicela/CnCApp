export interface Mancomunidad {
    id: number;
    nombre: string;
}

export interface MancomunidadRepository {
    findAll(): Promise<Mancomunidad[]>;
    findById(id: number): Promise<Mancomunidad | null>;
    create(nombre: string): Promise<Mancomunidad>;
    update(id: number, nombre: string): Promise<Mancomunidad>;
    delete(id: number): Promise<void>;
}
