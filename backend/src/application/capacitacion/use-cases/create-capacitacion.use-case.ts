import { injectable, inject } from 'tsyringe';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';
import { Capacitacion } from '../../../domain/capacitacion/entities/capacitacion.entity';
import { ValidationError } from '../../../domain/shared/errors';

@injectable()
export class CreateCapacitacionUseCase {
    constructor(
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository
    ) { }

    async execute(data: Partial<Capacitacion>): Promise<Capacitacion> {
        if (!data.nombre) {
            throw new ValidationError('El nombre de la capacitación es obligatorio');
        }

        // 1. Validar fechas
        if (data.fechaInicio && data.fechaFin) {
            const inicio = new Date(data.fechaInicio);
            const fin = new Date(data.fechaFin);
            if (fin < inicio) {
                throw new ValidationError('La fecha de finalización no puede ser anterior a la fecha de inicio');
            }
        }

        // 2. Validar nombre duplicado (Case Insensitive)
        const existing = await this.capacitacionRepository.findByNombre(data.nombre);
        if (existing) {
            throw new ValidationError(`Ya existe una capacitación con el nombre "${data.nombre}"`);
        }

        return this.capacitacionRepository.create(data);
    }
}
