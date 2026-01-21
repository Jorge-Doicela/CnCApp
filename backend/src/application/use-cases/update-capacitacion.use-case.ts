import { injectable, inject } from 'tsyringe';
import { CapacitacionRepository } from '../../domain/repositories/capacitacion.repository';
import { Capacitacion } from '../../domain/entities/capacitacion.entity';
import { NotFoundError } from '../../domain/errors';

@injectable()
export class UpdateCapacitacionUseCase {
    constructor(
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository
    ) { }

    async execute(id: number, data: Partial<Capacitacion>): Promise<Capacitacion> {
        const exists = await this.capacitacionRepository.findById(id);
        if (!exists) {
            throw new NotFoundError('Capacitación no encontrada');
        }
        return this.capacitacionRepository.update(id, data);
    }
}
