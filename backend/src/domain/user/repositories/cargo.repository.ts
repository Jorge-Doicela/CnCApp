export interface CargoRepository {
    findAll(): Promise<any[]>;
    findById(id: number): Promise<any | null>;
    create(nombre: string): Promise<any>;
    update(id: number, nombre: string): Promise<any>;
    delete(id: number): Promise<void>;
}
