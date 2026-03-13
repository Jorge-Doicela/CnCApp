import { injectable, inject } from 'tsyringe';
import prisma from '../../../config/database';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';
import { UsuarioCapacitacion } from '../../../domain/usuario-capacitacion/entities/usuario-capacitacion.entity';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';
import { EstadoCapacitacionEnum } from '../../../domain/shared/constants/enums';
import { ValidationError } from '../../../domain/shared/errors';

@injectable()
export class InscribirUsuarioUseCase {
    constructor(
        @inject('UsuarioCapacitacionRepository') private repository: UsuarioCapacitacionRepository,
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository
    ) { }

    async execute(data: Partial<UsuarioCapacitacion>) {
        if (!data.usuarioId || !data.capacitacionId) {
            throw new ValidationError('ID de usuario y capacitación son obligatorios');
        }

        return await prisma.$transaction(async (tx) => {
            // 1. Obtener capacitación con bloqueo (o al menos leer datos frescos en la transacción)
            const capacitacion = await tx.capacitacion.findUnique({
                where: { id: data.capacitacionId }
            });

            if (!capacitacion) {
                throw new ValidationError('La capacitación no existe');
            }

            if (capacitacion.estado === EstadoCapacitacionEnum.REALIZADA || capacitacion.estado === EstadoCapacitacionEnum.CANCELADA) {
                throw new ValidationError(`No es posible inscribirse: la capacitación se encuentra ${capacitacion.estado}`);
            }

            if (capacitacion.cuposDisponibles !== null && capacitacion.cuposDisponibles <= 0) {
                throw new ValidationError('Lo sentimos, ya no quedan cupos disponibles para esta capacitación');
            }

            // 2. Verificar duplicidad
            const existing = await tx.usuarioCapacitacion.findUnique({
                where: {
                    usuarioId_capacitacionId: {
                        usuarioId: data.usuarioId!,
                        capacitacionId: data.capacitacionId!
                    }
                }
            });

            if (existing) {
                throw new ValidationError('Usted ya se encuentra inscrito en esta capacitación');
            }

            // 3. Crear inscripción
            const result = await tx.usuarioCapacitacion.create({
                data: {
                    usuarioId: data.usuarioId!,
                    capacitacionId: data.capacitacionId!,
                    rolCapacitacion: data.rolCapacitacion || 'Participante',
                    asistio: data.asistio || false,
                    estadoInscripcion: data.estadoInscripcion || 'Activa'
                },
                include: {
                    usuario: true,
                    capacitacion: true
                }
            });

            // 4. Decrementar cupo de forma atómica
            await tx.capacitacion.update({
                where: { id: data.capacitacionId },
                data: {
                    cuposDisponibles: {
                        decrement: 1
                    }
                }
            });

            return result;
        });
    }
}
