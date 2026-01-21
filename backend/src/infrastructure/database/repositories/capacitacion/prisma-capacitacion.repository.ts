import { injectable } from 'tsyringe';
import prisma from '../../../../config/database';
import { Capacitacion } from '../../../../domain/capacitacion/entities/capacitacion.entity';
import { CapacitacionRepository } from '../../../../domain/capacitacion/repositories/capacitacion.repository';
import { CapacitacionMapper } from '../../../../domain/capacitacion/mappers/capacitacion.mapper';

@injectable()
export class PrismaCapacitacionRepository implements CapacitacionRepository {
    async create(data: Partial<Capacitacion>): Promise<Capacitacion> {
        const capacitacion = await prisma.capacitacion.create({
            data: {
                nombre: data.nombre!,
                descripcion: data.descripcion,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin,
                lugar: data.lugar,
                cuposDisponibles: data.cuposDisponibles || 0,
                modalidad: data.modalidad,
                estado: data.estado || 'Activa'
            }
        });
        return CapacitacionMapper.toDomain(capacitacion);
    }

    async update(id: number, data: Partial<Capacitacion>): Promise<Capacitacion> {
        const capacitacion = await prisma.capacitacion.update({
            where: { id },
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin,
                lugar: data.lugar,
                cuposDisponibles: data.cuposDisponibles,
                modalidad: data.modalidad,
                estado: data.estado
            }
        });
        return CapacitacionMapper.toDomain(capacitacion);
    }

    async findById(id: number): Promise<Capacitacion | null> {
        const capacitacion = await prisma.capacitacion.findUnique({
            where: { id }
        });
        return capacitacion ? CapacitacionMapper.toDomain(capacitacion) : null;
    }

    async findAll(): Promise<Capacitacion[]> {
        const capacitaciones = await prisma.capacitacion.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return capacitaciones.map(c => CapacitacionMapper.toDomain(c));
    }

    async delete(id: number): Promise<void> {
        await prisma.capacitacion.delete({
            where: { id }
        });
    }
}
