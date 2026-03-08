import { injectable, inject } from 'tsyringe';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';
import { UsuarioCapacitacion } from '../../../domain/usuario-capacitacion/entities/usuario-capacitacion.entity';
import { ValidationError } from '../../../domain/shared/errors';

@injectable()
export class InscribirUsuarioUseCase {
    constructor(
        @inject('UsuarioCapacitacionRepository') private repository: UsuarioCapacitacionRepository
    ) { }

    async execute(data: Partial<UsuarioCapacitacion>) {
        if (!data.usuarioId || !data.capacitacionId) {
            throw new ValidationError('ID de usuario y capacitación son obligatorios');
        }

        const existing = await this.repository.findByUserAndCapacitacion(data.usuarioId, data.capacitacionId);
        if (existing) {
            throw new ValidationError('Usted ya se encuentra inscrito en esta capacitación');
        }

        return this.repository.create(data);
    }
}
