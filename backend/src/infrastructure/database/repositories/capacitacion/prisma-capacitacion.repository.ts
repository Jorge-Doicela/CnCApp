import { injectable } from 'tsyringe';
import prisma from '../../../../config/database';
import { Capacitacion } from '../../../../domain/capacitacion/entities/capacitacion.entity';
import { CapacitacionRepository } from '../../../../domain/capacitacion/repositories/capacitacion.repository';
import { CapacitacionMapper } from '../../../../domain/capacitacion/mappers/capacitacion.mapper';
import { EstadoCapacitacionEnum, RolCapacitacionEnum } from '../../../../domain/shared/constants/enums';

@injectable()
export class PrismaCapacitacionRepository implements CapacitacionRepository {
    async create(data: Partial<Capacitacion>): Promise<Capacitacion> {
        const inscripciones = [];

        // Agregar expositores
        if (data.expositores) {
            inscripciones.push(...data.expositores.map(id => ({
                usuarioId: id,
                rolCapacitacion: RolCapacitacionEnum.EXPOSITOR,
                estadoInscripcion: 'Activa'
            })));
        }

        // Agregar participantes
        if (data.idsUsuarios) {
            inscripciones.push(...data.idsUsuarios.map(id => ({
                usuarioId: id,
                rolCapacitacion: RolCapacitacionEnum.PARTICIPANTE,
                estadoInscripcion: 'Activa'
            })));
        }

        const capacitacion = await prisma.capacitacion.create({
            data: {
                nombre: data.nombre!,
                descripcion: data.descripcion,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin,
                lugar: data.lugar,
                cuposDisponibles: data.cuposDisponibles || 0,
                modalidad: data.modalidad,
                estado: data.estado || EstadoCapacitacionEnum.PENDIENTE,
                plantillaId: data.plantillaId,
                horaInicio: data.horaInicio,
                horaFin: data.horaFin,
                horas: data.horas,
                enlaceVirtual: data.enlaceVirtual,
                certificado: data.certificado,
                inscripciones: inscripciones.length > 0 ? {
                    create: inscripciones
                } : undefined
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
                plantillaId: data.plantillaId,
                horaInicio: data.horaInicio,
                horaFin: data.horaFin,
                horas: data.horas,
                enlaceVirtual: data.enlaceVirtual,
                certificado: data.certificado
            },
            include: {
                inscripciones: true
            }
        });

        // 2. Actualizar relaciones si se proporcionan idsUsuarios o expositores
        if (data.idsUsuarios !== undefined || data.expositores !== undefined) {
            // Obtener IDs existentes para cada rol
            const currentInscripciones = await prisma.usuarioCapacitacion.findMany({
                where: { capacitacionId: id }
            });

            // Unir todos los IDs que se quieren mantener/agregar
            const targetInscripciones: { usuarioId: number, rol: string }[] = [];

            if (data.expositores) {
                targetInscripciones.push(...data.expositores.map(uId => ({ usuarioId: uId, rol: RolCapacitacionEnum.EXPOSITOR })));
            }
            if (data.idsUsuarios) {
                // Un usuario no puede ser ambos, prevalece expositor si está en ambos
                data.idsUsuarios.forEach(uId => {
                    if (!targetInscripciones.some(t => t.usuarioId === uId)) {
                        targetInscripciones.push({ usuarioId: uId, rol: RolCapacitacionEnum.PARTICIPANTE });
                    }
                });
            }

            const targetIds = targetInscripciones.map(t => t.usuarioId);
            const currentIds = currentInscripciones.map(i => i.usuarioId);

            // Identificar los que se van
            const toRemove = currentIds.filter(cid => !targetIds.includes(cid));
            if (toRemove.length > 0) {
                await prisma.usuarioCapacitacion.deleteMany({
                    where: {
                        capacitacionId: id,
                        usuarioId: { in: toRemove }
                    }
                });
            }

            // Identificar los que se quedan pero tal vez con rol diferente
            const toUpdateRole = targetInscripciones.filter(t => {
                const current = currentInscripciones.find(ci => ci.usuarioId === t.usuarioId);
                return current && current.rolCapacitacion !== t.rol;
            });

            for (const item of toUpdateRole) {
                await prisma.usuarioCapacitacion.update({
                    where: {
                        usuarioId_capacitacionId: {
                            usuarioId: item.usuarioId,
                            capacitacionId: id
                        }
                    },
                    data: {
                        rolCapacitacion: item.rol
                    }
                });
            }

            // Identificar los nuevos para agregar
            const toAdd = targetInscripciones.filter(t => !currentIds.includes(t.usuarioId));
            if (toAdd.length > 0) {
                await prisma.usuarioCapacitacion.createMany({
                    data: toAdd.map(t => ({
                        usuarioId: t.usuarioId,
                        capacitacionId: id,
                        rolCapacitacion: t.rol,
                        estadoInscripcion: 'Activa'
                    }))
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

    async findAll(expositorId?: number): Promise<Capacitacion[]> {
        const capacitaciones = await prisma.capacitacion.findMany({
            where: expositorId ? {
                inscripciones: {
                    some: {
                        usuarioId: expositorId,
                        rolCapacitacion: RolCapacitacionEnum.EXPOSITOR
                    }
                }
            } : undefined,
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
