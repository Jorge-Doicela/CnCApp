/**
 * Interfaz genérica para entidades simples con solo id y nombre.
 * Evita duplicar la misma interfaz para Cargo, GradoOcupacional, Mancomunidad, etc.
 */
export interface SimpleEntity {
    id: number;
    nombre: string;
}

export interface SimpleEntityRepository<T extends SimpleEntity = SimpleEntity> {
    findAll(): Promise<T[]>;
    findById(id: number): Promise<T | null>;
    create(nombre: string): Promise<T>;
    update(id: number, nombre: string): Promise<T>;
    delete(id: number): Promise<void>;
}
