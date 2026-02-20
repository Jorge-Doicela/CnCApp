import prisma from '../../config/database';
import { injectable } from 'tsyringe';
import { Entidad, EntidadRepository } from '../../domain/user/entidad.repository';

@injectable()
export class PrismaEntidadRepository implements EntidadRepository {
    async findAll(): Promise<Entidad[]> {
        const entidades = await prisma.entidad.findMany({
            orderBy: { nombre: 'asc' }
        });
        return entidades.map(e => ({
            id: e.id,
            nombre: e.nombre,
            estado: true, // Mocked as active
            imagen: '' // Mocked as empty
        }));
    }

    async findById(id: number): Promise<Entidad | null> {
        const entidad = await prisma.entidad.findUnique({
            where: { id }
        });
        if (!entidad) return null;
        return {
            id: entidad.id,
            nombre: entidad.nombre,
            estado: true,
            imagen: ''
        };
    }

    async findByName(nombre: string): Promise<Entidad | null> {
        // Find first because nombre might not be unique in schema (though it refers to unique entity concept)
        // Schema: nombre String @map("Nombre_Entidad") @db.VarChar(200) -- NO UNIQUE constraint in schema!
        // So use findFirst.
        const entidad = await prisma.entidad.findFirst({
            where: { nombre }
        });
        if (!entidad) return null;
        return {
            id: entidad.id,
            nombre: entidad.nombre,
            estado: true,
            imagen: ''
        };
    }

    async create(entidad: Omit<Entidad, 'id'>): Promise<Entidad> {
        const newEntidad = await prisma.entidad.create({
            data: {
                nombre: entidad.nombre
            }
        });
        return {
            id: newEntidad.id,
            nombre: newEntidad.nombre,
            estado: true,
            imagen: ''
        };
    }

    async update(id: number, entidad: Partial<Entidad>): Promise<Entidad> {
        const updated = await prisma.entidad.update({
            where: { id },
            data: {
                ...(entidad.nombre && { nombre: entidad.nombre })
            }
        });
        return {
            id: updated.id,
            nombre: updated.nombre,
            estado: true,
            imagen: ''
        };
    }

    async delete(id: number): Promise<void> {
        await prisma.entidad.delete({
            where: { id }
        });
    }
}
