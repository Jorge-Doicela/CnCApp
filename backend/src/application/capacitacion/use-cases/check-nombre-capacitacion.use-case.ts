import { injectable, inject } from 'tsyringe';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';

@injectable()
export class CheckNombreCapacitacionUseCase {
    constructor(
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository
    ) { }

    async execute(nombre: string, excludeId?: number): Promise<boolean> {
        const capacitacion = await this.capacitacionRepository.findByNombre(nombre, excludeId);
        return !!capacitacion;
    }
}
