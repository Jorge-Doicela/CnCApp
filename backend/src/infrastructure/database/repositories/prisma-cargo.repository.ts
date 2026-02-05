import { injectable } from 'tsyringe';
import prisma from '../../../config/database';
import { CargoRepository } from '../../../domain/user/repositories/cargo.repository';

@injectable()
export class PrismaCargoRepository implements CargoRepository {
    async findAll(): Promise<any[]> {
        return prisma.cargo.findMany({
            orderBy: { nombre: 'asc' }
        });
    }

    async findById(id: number): Promise<any | null> {
        return prisma.cargo.findUnique({
            where: { id }
        });
    }

    async create(nombre: string): Promise<any> {
        return prisma.cargo.create({
            data: { nombre }
        });
    }

    async update(id: number, nombre: string): Promise<any> {
        return prisma.cargo.update({
            where: { id },
            data: { nombre }
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.cargo.delete({
            where: { id }
        });
    }
}
