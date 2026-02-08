import { Capacitacion as PrismaCapacitacion } from '@prisma/client';
import { Capacitacion } from '../entities/capacitacion.entity';

export class CapacitacionMapper {
    static toDomain(prismaCapacitacion: PrismaCapacitacion): Capacitacion {
        return {
            id: prismaCapacitacion.id,
            nombre: prismaCapacitacion.nombre,
            descripcion: prismaCapacitacion.descripcion,
            fechaInicio: prismaCapacitacion.fechaInicio,
            fechaFin: prismaCapacitacion.fechaFin,
            lugar: prismaCapacitacion.lugar,
            cuposDisponibles: prismaCapacitacion.cuposDisponibles,
            modalidad: prismaCapacitacion.modalidad,
            estado: prismaCapacitacion.estado,
            createdAt: prismaCapacitacion.createdAt,
            idsUsuarios: (prismaCapacitacion as any).inscripciones?.map((i: any) => i.usuarioId) || []
        };
    }
}
