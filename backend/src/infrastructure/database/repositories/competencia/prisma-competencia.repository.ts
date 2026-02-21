import prisma from '../../../../config/database';
import { CompetenciaRepository } from '../../../../domain/competencia/repositories/competencia.repository';
import { injectable } from 'tsyringe';

@injectable()
export class PrismaCompetenciaRepository implements CompetenciaRepository {
    async findAll(): Promise<any[]> {
        return prisma.competencia.findMany();
    }

    async findById(id: number): Promise<any | null> {
        return prisma.competencia.findUnique({ where: { id } });
    }

    async create(data: any): Promise<any> {
        return prisma.competencia.create({
            data: {
                ...data,
                fecha_ultima_actualizacion: new Date()
            }
        });
    }

    async update(id: number, data: any): Promise<any> {
        return prisma.competencia.update({
            where: { id },
            data: {
                ...data,
                fecha_ultima_actualizacion: new Date()
            }
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.competencia.delete({ where: { id } });
    }
}
