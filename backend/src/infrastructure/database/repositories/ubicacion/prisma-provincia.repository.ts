import { injectable } from 'tsyringe';
import prisma from '../../../../config/database';
import { ProvinciaRepository } from '../../../../domain/ubicacion/repositories/provincia.repository';

@injectable()
export class PrismaProvinciaRepository implements ProvinciaRepository {
    async findAll(): Promise<any[]> {
        return prisma.provincia.findMany({
            orderBy: {
                nombre: 'asc'
            }
        });
    }

    async update(id: number, data: any): Promise<any> {
        return prisma.provincia.update({
            where: { id },
            data
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.provincia.delete({
            where: { id }
        });
    }
}
