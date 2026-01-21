import { injectable, inject } from 'tsyringe';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';
import { Capacitacion } from '../../../domain/capacitacion/entities/capacitacion.entity';

@injectable()
export class GetAllCapacitacionesUseCase {
    constructor(
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository
    ) { }

    async execute(): Promise<Capacitacion[]> {
        return this.capacitacionRepository.findAll();
    }
}
