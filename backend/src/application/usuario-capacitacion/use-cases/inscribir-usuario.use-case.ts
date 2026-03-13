import { injectable, inject } from 'tsyringe';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';
import { UsuarioCapacitacion } from '../../../domain/usuario-capacitacion/entities/usuario-capacitacion.entity';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';
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

        // 1. Verificar existencia y cupos de la capacitación
        const capacitacion = await this.capacitacionRepository.findById(data.capacitacionId);
        if (!capacitacion) {
            throw new ValidationError('La capacitación no existe');
        }

        if (capacitacion.estado === 'Realizada' || capacitacion.estado === 'Cancelada') {
            throw new ValidationError(`No es posible inscribirse: la capacitación se encuentra ${capacitacion.estado}`);
        }

        if (capacitacion.cuposDisponibles !== null && capacitacion.cuposDisponibles <= 0) {
            throw new ValidationError('Lo sentimos, ya no quedan cupos disponibles para esta capacitación');
        }

        // 2. Verificar duplicidad
        const existing = await this.repository.findByUserAndCapacitacion(data.usuarioId, data.capacitacionId);
        if (existing) {
            throw new ValidationError('Usted ya se encuentra inscrito en esta capacitación');
        }

        // 3. Crear inscripción
        const result = await this.repository.create(data);

        // 4. Actualizar cupos (decremento)
        if (capacitacion.cuposDisponibles !== null && capacitacion.cuposDisponibles > 0) {
            await this.capacitacionRepository.update(capacitacion.id!, {
                cuposDisponibles: capacitacion.cuposDisponibles - 1
            });
        }

        return result;
    }
}
