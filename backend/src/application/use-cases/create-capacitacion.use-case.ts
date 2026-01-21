import { injectable, inject } from 'tsyringe';
import { CapacitacionRepository } from '../../domain/repositories/capacitacion.repository';
import { Capacitacion } from '../../domain/entities/capacitacion.entity';

@injectable()
export class CreateCapacitacionUseCase {
    constructor(
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository
    ) { }

    async execute(data: Partial<Capacitacion>): Promise<Capacitacion> {
        return this.capacitacionRepository.create(data);
    }
}
