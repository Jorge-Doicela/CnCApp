import { injectable, inject } from 'tsyringe';
import { CapacitacionRepository } from '../../domain/repositories/capacitacion.repository';
import { NotFoundError } from '../../domain/errors';

@injectable()
export class DeleteCapacitacionUseCase {
    constructor(
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository
    ) { }

    async execute(id: number): Promise<void> {
        const exists = await this.capacitacionRepository.findById(id);
        if (!exists) {
            throw new NotFoundError('Capacitación no encontrada');
        }
        await this.capacitacionRepository.delete(id);
    }
}
