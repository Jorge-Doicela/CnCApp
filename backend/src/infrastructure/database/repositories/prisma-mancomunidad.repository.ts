import { injectable } from 'tsyringe';
import { Mancomunidad, MancomunidadRepository } from '../../../domain/mancomunidad/repositories/mancomunidad.repository';
import prisma from '../../../config/database';

@injectable()
export class PrismaMancomunidadRepository implements MancomunidadRepository {
    async findAll(): Promise<Mancomunidad[]> {
        return await prisma.mancomunidad.findMany({
            orderBy: { nombre: 'asc' }
        });
    }

    async findById(id: number): Promise<Mancomunidad | null> {
        return await prisma.mancomunidad.findUnique({
            where: { id }
        });
    }

    async create(nombre: string): Promise<Mancomunidad> {
        return await prisma.mancomunidad.create({
            data: { nombre }
        });
    }

    async update(id: number, nombre: string): Promise<Mancomunidad> {
        return await prisma.mancomunidad.update({
            where: { id },
            data: { nombre }
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.mancomunidad.delete({
            where: { id }
        });
    }
}
