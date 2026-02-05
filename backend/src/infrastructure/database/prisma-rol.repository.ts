import { injectable } from 'tsyringe';
import prisma from '../../config/database';

@injectable()
export class PrismaRolRepository implements RolRepository {
    async findAll(): Promise<Rol[]> {
        return await prisma.rol.findMany();
    }
}
