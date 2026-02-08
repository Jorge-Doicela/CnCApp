import { injectable, inject } from 'tsyringe';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';
import { UsuarioCapacitacion } from '../../../domain/usuario-capacitacion/entities/usuario-capacitacion.entity';

@injectable()
export class InscribirUsuarioUseCase {
    constructor(
        @inject('UsuarioCapacitacionRepository') private repository: UsuarioCapacitacionRepository
    ) { }

    async execute(data: Partial<UsuarioCapacitacion>) {
        return this.repository.create(data);
    }
}
