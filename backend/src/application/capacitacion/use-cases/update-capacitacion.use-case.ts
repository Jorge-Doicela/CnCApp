import { injectable, inject } from 'tsyringe';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';
import { Capacitacion } from '../../../domain/capacitacion/entities/capacitacion.entity';
import { NotFoundError, ValidationError } from '../../../domain/shared/errors';

@injectable()
export class UpdateCapacitacionUseCase {
    constructor(
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository
    ) { }

    async execute(id: number, data: Partial<Capacitacion>): Promise<Capacitacion> {
        const current = await this.capacitacionRepository.findById(id);
        if (!current) {
            throw new NotFoundError('Capacitación no encontrada');
        }

        // 1. Validar fechas (comparando con los datos actuales si no vienen en el payload)
        const fechaInicio = data.fechaInicio || current.fechaInicio;
        const fechaFin = data.fechaFin || current.fechaFin;

        if (fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            if (fin < inicio) {
                throw new ValidationError('La fecha de finalización no puede ser anterior a la fecha de inicio');
            }
        }

        // 2. Validar nombre duplicado si el nombre está cambiando
        if (data.nombre && data.nombre.trim().toLowerCase() !== current.nombre.toLowerCase()) {
            const existing = await this.capacitacionRepository.findByNombre(data.nombre, id);
            if (existing) {
                throw new ValidationError(`Ya existe otra capacitación con el nombre "${data.nombre}"`);
            }
        }

        return this.capacitacionRepository.update(id, data);
    }
}
