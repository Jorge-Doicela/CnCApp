import { PrismaClient } from '@prisma/client';
import { injectable } from 'tsyringe';
import { GradoOcupacional, GradoOcupacionalRepository } from '../../../domain/grado-ocupacional/repositories/grado-ocupacional.repository';
import prisma from '../../../config/database';

@injectable()
export class PrismaGradoOcupacionalRepository implements GradoOcupacionalRepository {
    async findAll(): Promise<GradoOcupacional[]> {
        return await prisma.gradoOcupacional.findMany({
            orderBy: { id: 'asc' }
        });
    }

    async findById(id: number): Promise<GradoOcupacional | null> {
        return await prisma.gradoOcupacional.findUnique({
            where: { id }
        });
    }

    async create(nombre: string): Promise<GradoOcupacional> {
        return await prisma.gradoOcupacional.create({
            data: { nombre }
        });
    }

    async update(id: number, nombre: string): Promise<GradoOcupacional> {
        return await prisma.gradoOcupacional.update({
            where: { id },
            data: { nombre }
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.gradoOcupacional.delete({
            where: { id }
        });
    }
}
