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
                estado: data.estado || 'Activa',
                plantillaId: data.plantillaId
            }
        });
        return CapacitacionMapper.toDomain(capacitacion);
    }

    async update(id: number, data: Partial<Capacitacion>): Promise<Capacitacion> {
        // 1. Actualizar datos escalares
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
                estado: data.estado,
                plantillaId: data.plantillaId
            },
            include: {
                inscripciones: true
            }
        });

        // 2. Actualizar relaciones si se proporcionan idsUsuarios
        if (data.idsUsuarios) {
            const currentIds = capacitacion.inscripciones.map(i => i.usuarioId);
            const newIds = data.idsUsuarios;

            // Identificar cambios
            const toAdd = newIds.filter(id => !currentIds.includes(id));
            const toRemove = currentIds.filter(id => !newIds.includes(id));

            // Eliminar los que ya no están (respetando integridad referencial si es necesario, 
            // pero normalmente en una edición de lista se asume eliminación)
            // Nota: Esto borrará metadata como asistencia. Si se quiere preservar historial, la lógica sería diferente.
            // Para "edición de participantes", eliminar la inscripción parece correcto si se desmarca.
            if (toRemove.length > 0) {
                await prisma.usuarioCapacitacion.deleteMany({
                    where: {
                        capacitacionId: id,
                        usuarioId: { in: toRemove }
                    }
                });
            }

            // Agregar nuevos
            if (toAdd.length > 0) {
                const dataToCreate = toAdd.map(usuarioId => ({
                    usuarioId,
                    capacitacionId: id,
                    fechaInscripcion: new Date(),
                    estadoInscripcion: 'Inscrito'
                }));
                await prisma.usuarioCapacitacion.createMany({
                    data: dataToCreate
                });
            }
        }

        // 3. Volver a cargar para devolver estructura completa actualizada
        return this.findById(id) as Promise<Capacitacion>;
    }

    async findById(id: number): Promise<Capacitacion | null> {
        const capacitacion = await prisma.capacitacion.findUnique({
            where: { id },
            include: {
                inscripciones: true,
                plantilla: true
            }
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
