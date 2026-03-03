export interface GradoOcupacional {
    id: number;
    nombre: string;
}

export interface GradoOcupacionalRepository {
    findAll(): Promise<GradoOcupacional[]>;
    findById(id: number): Promise<GradoOcupacional | null>;
    create(nombre: string): Promise<GradoOcupacional>;
    update(id: number, nombre: string): Promise<GradoOcupacional>;
    delete(id: number): Promise<void>;
}
