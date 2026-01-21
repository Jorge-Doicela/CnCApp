import { Capacitacion } from '../entities/capacitacion.entity';

export interface CapacitacionRepository {
    create(capacitacion: Partial<Capacitacion>): Promise<Capacitacion>;
    update(id: number, capacitacion: Partial<Capacitacion>): Promise<Capacitacion>;
    findById(id: number): Promise<Capacitacion | null>;
    findAll(): Promise<Capacitacion[]>;
    delete(id: number): Promise<void>;
}
