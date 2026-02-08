import { injectable, inject } from 'tsyringe';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';

@injectable()
export class EliminarInscripcionUseCase {
    constructor(
        @inject('UsuarioCapacitacionRepository') private repository: UsuarioCapacitacionRepository
    ) { }

    async execute(id: number) {
        return this.repository.delete(id);
    }

    async executeByRelacion(idUsuarioConferencia: number) {
        return this.repository.delete(idUsuarioConferencia);
    }

    async executeNoAsistieron(capacitacionId: number) {
        return this.repository.deleteNoAsistieron(capacitacionId);
    }
}
