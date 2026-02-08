
import { Plantilla } from './plantilla.entity';

export interface PlantillaRepository {
    create(plantilla: Partial<Plantilla>): Promise<Plantilla>;
    findAll(): Promise<Plantilla[]>;
    findById(id: number): Promise<Plantilla | null>;
    update(id: number, plantilla: Partial<Plantilla>): Promise<Plantilla>;
    delete(id: number): Promise<void>;
    activar(id: number): Promise<Plantilla>;
    desactivarTodas(): Promise<void>;
}
