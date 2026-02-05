import prisma from '../../config/database';
import { injectable } from 'tsyringe';
import { Entidad, EntidadRepository } from '../../domain/user/entidad.repository';

@injectable()
export class PrismaEntidadRepository implements EntidadRepository {
    async findAll(): Promise<Entidad[]> {
        const entidades = await prisma.entidad.findMany();
        return entidades.map(e => ({
            id: e.id,
            nombre: e.nombre
        }));
    }
}
