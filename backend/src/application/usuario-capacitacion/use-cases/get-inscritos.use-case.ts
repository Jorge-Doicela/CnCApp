import { injectable, inject } from 'tsyringe';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';

@injectable()
export class GetInscritosUseCase {
    constructor(
        @inject('UsuarioCapacitacionRepository') private repository: UsuarioCapacitacionRepository
    ) { }

    async execute(capacitacionId: number) {
        return this.repository.findByCapacitacionId(capacitacionId);
    }
}
