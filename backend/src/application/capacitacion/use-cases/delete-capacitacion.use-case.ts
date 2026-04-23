import { injectable, inject } from 'tsyringe';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';
import { NotFoundError, ValidationError } from '../../../domain/shared/errors';
import { EstadoCapacitacionEnum } from '../../../domain/shared/constants/enums';

@injectable()
export class DeleteCapacitacionUseCase {
    constructor(
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository
    ) { }

    async execute(id: number): Promise<void> {
        const capacitacion = await this.capacitacionRepository.findById(id);
        
        if (!capacitacion) {
            throw new NotFoundError('Capacitación no encontrada');
        }

        // Impedir borrado de capacitaciones finalizadas o con certificados
        if (capacitacion.estado === EstadoCapacitacionEnum.REALIZADA) {
            throw new ValidationError('No se puede eliminar una capacitación que ya ha finalizado');
        }

        if (capacitacion.certificado) {
            throw new ValidationError('No se puede eliminar una capacitación que ya tiene certificados emitidos');
        }

        await this.capacitacionRepository.delete(id);
    }
}
