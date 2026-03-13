//backend/src/infrastructure/database/repositories/capacitacion/prisma-capacitacion.repository.ts
import { injectable } from 'tsyringe';
import prisma from '../../../../config/database';
import { Capacitacion } from '../../../../domain/capacitacion/entities/capacitacion.entity';
import { CapacitacionRepository } from '../../../../domain/capacitacion/repositories/capacitacion.repository';
import { CapacitacionMapper } from '../../../../domain/capacitacion/mappers/capacitacion.mapper';
import { EstadoCapacitacionEnum, RolCapacitacionEnum } from '../../../../domain/shared/constants/enums';
import { randomUUID } from 'crypto';

@injectable()
export class PrismaCapacitacionRepository implements CapacitacionRepository {
    async create(data: Partial<Capacitacion>): Promise<Capacitacion> {
        const inscripciones = [];

        // Obtener IDs únicos de expositores y participantes
        const expositoresSet = new Set(data.expositores || []);
        const participantesSet = new Set(data.idsUsuarios || []);

        // Si un usuario es expositor, no debe estar en participantes
        expositoresSet.forEach(id => participantesSet.delete(id));

        // Agregar expositores
        inscripciones.push(...Array.from(expositoresSet).map(id => ({
            usuarioId: id,
            rolCapacitacion: RolCapacitacionEnum.EXPOSITOR,
            estadoInscripcion: 'Activa'
        })));

        // Agregar participantes
        inscripciones.push(...Array.from(participantesSet).map(id => ({
            usuarioId: id,
            rolCapacitacion: RolCapacitacionEnum.PARTICIPANTE,
            estadoInscripcion: 'Activa'
        })));

        // Calcular cupos reales: total - participantes iniciales
        // Nota: Solo restamos participantes (RolCapacitacionEnum.PARTICIPANTE)
        const totalParticipantes = participantesSet.size;
        const cuposIniciales = data.cuposDisponibles || 0;
        const cuposReales = Math.max(0, cuposIniciales - totalParticipantes);

        const capacitacion = await prisma.capacitacion.create({
            data: {
                nombre: data.nombre!,
                descripcion: data.descripcion,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin,
                lugar: data.lugar,
                cuposDisponibles: cuposReales,
                modalidad: data.modalidad,
                estado: data.estado || EstadoCapacitacionEnum.PENDIENTE,
                plantillaId: data.plantillaId,
                horaInicio: data.horaInicio,
                horaFin: data.horaFin,
                horas: data.horas,
                enlaceVirtual: data.enlaceVirtual,
                certificado: data.certificado,
                codigoQrEvento: randomUUID(),
                inscripciones: inscripciones.length > 0 ? {
                    create: inscripciones
                } : undefined,
                entidadesEncargadas: data.entidadesEncargadas && data.entidadesEncargadas.length > 0 ? {
                    connect: data.entidadesEncargadas.map(id => ({ id }))
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
                cuposDisponibles: data.cuposDisponibles ?? undefined,
                modalidad: data.modalidad,
                estado: data.estado ?? undefined,
                plantillaId: data.plantillaId,
                horaInicio: data.horaInicio,
                horaFin: data.horaFin,
                horas: data.horas,
                enlaceVirtual: data.enlaceVirtual,
                certificado: data.certificado,
                tipoEvento: data.tipoEvento,
                entidadesEncargadas: data.entidadesEncargadas ? {
                    set: data.entidadesEncargadas.map(id => ({ id }))
                } : undefined
            },
            include: {
                inscripciones: true
            }
        });

        // 2. Actualizar relaciones si se proporcionan idsUsuarios o expositores
        if (data.idsUsuarios !== undefined || data.expositores !== undefined) {
            const currentInscripciones = await prisma.usuarioCapacitacion.findMany({
                where: { capacitacionId: id }
            });

            const targetInscripciones: { usuarioId: number, rol: string }[] = [];

            if (data.expositores) {
                targetInscripciones.push(...data.expositores.map(uId => ({ usuarioId: uId, rol: RolCapacitacionEnum.EXPOSITOR })));
            }
            if (data.idsUsuarios) {
                data.idsUsuarios.forEach(uId => {
                    if (!targetInscripciones.some(t => t.usuarioId === uId)) {
                        targetInscripciones.push({ usuarioId: uId, rol: RolCapacitacionEnum.PARTICIPANTE });
                    }
                });
            }

            const targetIds = targetInscripciones.map(t => t.usuarioId);
            const currentIds = currentInscripciones.map(i => i.usuarioId);

            const toRemove = currentIds.filter(cid => !targetIds.includes(cid));
            if (toRemove.length > 0) {
                await prisma.usuarioCapacitacion.deleteMany({
                    where: {
                        capacitacionId: id,
                        usuarioId: { in: toRemove }
                    }
                });
            }

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

            const toAdd = targetInscripciones.filter(t => !currentIds.includes(t.usuarioId));
            
            // Lógica Híbrida de Cupos:
            // Solo ajustamos de forma atómica si NO se está enviando un nuevo valor absoluto de cuposDisponibles
            if (data.cuposDisponibles === undefined) {
                const participantesEliminados = currentInscripciones.filter(i => 
                    i.rolCapacitacion === RolCapacitacionEnum.PARTICIPANTE && 
                    !targetIds.includes(i.usuarioId)
                ).length;

                const participantesNuevos = toAdd.filter(t => t.rol === RolCapacitacionEnum.PARTICIPANTE).length;
                const balanceParticipantes = participantesNuevos - participantesEliminados;

                // Actualizar cuposDisponibles de forma atómica basado en el balance neto
                if (balanceParticipantes !== 0) {
                    await prisma.capacitacion.update({
                        where: { id },
                        data: {
                            cuposDisponibles: {
                                decrement: balanceParticipantes
                            }
                        }
                    });
                }
            }

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

        return this.findById(id) as Promise<Capacitacion>;
    }

    async findById(id: number): Promise<Capacitacion | null> {
        const capacitacion = await prisma.capacitacion.findUnique({
            where: { id },
            include: {
                inscripciones: true,
                plantilla: true,
                entidadesEncargadas: true
            }
        });
        return capacitacion ? CapacitacionMapper.toDomain(capacitacion) : null;
    }

    async findByNombre(nombre: string, excludeId?: number): Promise<Capacitacion | null> {
        const capacitacion = await prisma.capacitacion.findFirst({
            where: {
                nombre: {
                    equals: nombre.trim(),
                    mode: 'insensitive'
                },
                id: excludeId ? { not: excludeId } : undefined
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

    async incrementarCupo(id: number): Promise<void> {
        await prisma.capacitacion.update({
            where: { id },
            data: {
                cuposDisponibles: {
                    increment: 1
                }
            }
        });
    }

    async decrementarCupo(id: number): Promise<void> {
        await prisma.capacitacion.update({
            where: { id },
            data: {
                cuposDisponibles: {
                    decrement: 1
                }
            }
        });
    }
}
