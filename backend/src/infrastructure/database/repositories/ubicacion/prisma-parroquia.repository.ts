import { injectable } from 'tsyringe';
import prisma from '../../../../config/database';
import { ParroquiaRepository } from '../../../../domain/ubicacion/repositories/parroquia.repository';

@injectable()
export class PrismaParroquiaRepository implements ParroquiaRepository {
    async findAll(): Promise<any[]> {
        return prisma.parroquia.findMany({
            include: {
                canton: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });
    }

    async update(id: number, data: any): Promise<any> {
        return prisma.parroquia.update({
            where: { id },
            data
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.parroquia.delete({
            where: { id }
        });
    }
}
