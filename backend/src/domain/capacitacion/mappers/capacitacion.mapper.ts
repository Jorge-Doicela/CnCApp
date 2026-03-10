import { Capacitacion as PrismaCapacitacion } from '@prisma/client';
import { Capacitacion } from '../entities/capacitacion.entity';
import { RolCapacitacionEnum } from '../../shared/constants/enums';

export class CapacitacionMapper {
    static toDomain(prismaCapacitacion: PrismaCapacitacion): Capacitacion {
        const inscripciones = (prismaCapacitacion as any).inscripciones || [];

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
            idsUsuarios: inscripciones
                .filter((i: any) => i.rolCapacitacion === RolCapacitacionEnum.PARTICIPANTE || !i.rolCapacitacion)
                .map((i: any) => i.usuarioId),
            expositores: inscripciones
                .filter((i: any) => i.rolCapacitacion === RolCapacitacionEnum.EXPOSITOR)
                .map((i: any) => i.usuarioId),
            plantillaId: (prismaCapacitacion as any).plantillaId,
            horaInicio: (prismaCapacitacion as any).horaInicio,
            horaFin: (prismaCapacitacion as any).horaFin,
            horas: (prismaCapacitacion as any).horas,
            enlaceVirtual: (prismaCapacitacion as any).enlaceVirtual,
            certificado: (prismaCapacitacion as any).certificado,
            plantilla: (prismaCapacitacion as any).plantilla
        };
    }
}
