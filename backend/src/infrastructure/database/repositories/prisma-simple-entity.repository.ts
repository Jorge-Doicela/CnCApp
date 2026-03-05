import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import { SimpleEntity, SimpleEntityRepository } from '../../../domain/shared/repositories/simple-entity.repository';
import { NotFoundError } from '../../../domain/shared/errors';
import prisma from '../../../config/database';

type PrismaModelName = keyof Omit<
    PrismaClient,
    | '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    | '$extends' | symbol
>;

/**
 * Repositorio genérico de Prisma para entidades simples (id + nombre).
 * Elimina la duplicación de código en PrismaCargoRepository,
 * PrismaGradoOcupacionalRepository, PrismaMancomunidadRepository, etc.
 *
 * Uso: new PrismaSimpleEntityRepository('cargo')
 */
export class PrismaSimpleEntityRepository implements SimpleEntityRepository {
    constructor(private readonly modelName: string) { }

    private get model(): any {
        return (prisma as any)[this.modelName];
    }

    async findAll(): Promise<SimpleEntity[]> {
        return this.model.findMany({ orderBy: { nombre: 'asc' } });
    }

    async findById(id: number): Promise<SimpleEntity | null> {
        return this.model.findUnique({ where: { id } });
    }

    async create(nombre: string): Promise<SimpleEntity> {
        return this.model.create({ data: { nombre } });
    }

    async update(id: number, nombre: string): Promise<SimpleEntity> {
        const exists = await this.findById(id);
        if (!exists) throw new NotFoundError(`Registro con id ${id} no encontrado`);
        return this.model.update({ where: { id }, data: { nombre } });
    }

    async delete(id: number): Promise<void> {
        const exists = await this.findById(id);
        if (!exists) throw new NotFoundError(`Registro con id ${id} no encontrado`);
        await this.model.delete({ where: { id } });
    }
}
