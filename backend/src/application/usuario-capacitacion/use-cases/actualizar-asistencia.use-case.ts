import { injectable, inject } from 'tsyringe';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';

@injectable()
export class ActualizarAsistenciaUseCase {
    constructor(
        @inject('UsuarioCapacitacionRepository') private repository: UsuarioCapacitacionRepository
    ) { }

    async execute(id: number, asistio: boolean) {
        return this.repository.updateAsistencia(id, asistio);
    }

    async executeMasiva(capacitacionId: number, asistio: boolean) {
        return this.repository.updateAsistenciaMasiva(capacitacionId, asistio);
    }
}
