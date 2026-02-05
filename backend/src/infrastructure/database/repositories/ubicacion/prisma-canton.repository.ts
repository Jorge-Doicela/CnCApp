import { injectable } from 'tsyringe';
import prisma from '../../../../config/database';
import { CantonRepository } from '../../../../domain/ubicacion/repositories/canton.repository';

@injectable()
export class PrismaCantonRepository implements CantonRepository {
    async findAll(): Promise<any[]> {
        return prisma.canton.findMany({
            orderBy: {
                nombre: 'asc'
            }
        });
    }
}
