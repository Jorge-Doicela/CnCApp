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
}
