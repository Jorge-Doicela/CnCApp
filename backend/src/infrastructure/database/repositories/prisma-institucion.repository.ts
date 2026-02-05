import { injectable } from 'tsyringe';
import prisma from '../../../config/database';
import { InstitucionRepository } from '../../../domain/institucion/repositories/institucion.repository';

@injectable()
export class PrismaInstitucionRepository implements InstitucionRepository {
    async findAll(): Promise<any[]> {
        return prisma.institucionSistema.findMany({
            orderBy: { nombre: 'asc' }
        });
    }

    async findById(id: number): Promise<any | null> {
        return prisma.institucionSistema.findUnique({
            where: { id }
        });
    }
}
