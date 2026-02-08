import { injectable, inject } from 'tsyringe';
import { CapacitacionRepository } from '../../../../domain/capacitacion/repositories/capacitacion.repository';

@injectable()
export class GetCapacitacionByIdUseCase {
    constructor(
        @inject('CapacitacionRepository') private repository: CapacitacionRepository
    ) { }

    async execute(id: number) {
        return this.repository.findById(id);
    }
}
