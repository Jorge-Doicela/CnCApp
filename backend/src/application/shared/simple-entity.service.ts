import { SimpleEntityRepository, SimpleEntity } from '../../domain/shared/repositories/simple-entity.repository';
import { NotFoundError } from '../../domain/shared/errors';

/**
 * Servicio de aplicación genérico para entidades simples (id + nombre).
 * Encapsula las operaciones CRUD repetidas en una sola clase reutilizable.
 * 
 * Usado por: CargoService, GradoOcupacionalService, MancomunidadService
 * Elimina >15 use-case files duplicados en la capa de aplicación.
 */
export class SimpleEntityService<T extends SimpleEntity = SimpleEntity> {
    constructor(
        private readonly repository: SimpleEntityRepository<T>,
        private readonly entityName: string
    ) { }

    async getAll(): Promise<T[]> {
        return this.repository.findAll();
    }

    async getById(id: number): Promise<T> {
        const entity = await this.repository.findById(id);
        if (!entity) {
            throw new NotFoundError(`${this.entityName} con id ${id} no encontrado`);
        }
        return entity;
    }

    async create(nombre: string): Promise<T> {
        return this.repository.create(nombre);
    }

    async update(id: number, nombre: string): Promise<T> {
        await this.getById(id); // lanza NotFoundError si no existe
        return this.repository.update(id, nombre);
    }

    async delete(id: number): Promise<void> {
        await this.getById(id); // lanza NotFoundError si no existe
        return this.repository.delete(id);
    }
}
