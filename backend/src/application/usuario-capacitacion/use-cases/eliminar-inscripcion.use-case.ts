import { injectable, inject } from 'tsyringe';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';

@injectable()
export class EliminarInscripcionUseCase {
    constructor(
        @inject('UsuarioCapacitacionRepository') private repository: UsuarioCapacitacionRepository,
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository
    ) { }

    async execute(id: number) {
        const inscripcion = await this.repository.findById(id);
        if (inscripcion) {
            await this.repository.delete(id);
            await this.capacitacionRepository.incrementarCupo(inscripcion.capacitacionId);
        }
    }

    async executeByRelacion(idUsuarioConferencia: number) {
        const inscripcion = await this.repository.findById(idUsuarioConferencia);
        if (inscripcion) {
            await this.repository.delete(idUsuarioConferencia);
            await this.capacitacionRepository.incrementarCupo(inscripcion.capacitacionId);
        }
    }

    async executeNoAsistieron(capacitacionId: number) {
        // En este caso, como es masivo (no asistieron), no solemos recuperar cupos 
        // porque la capacitación ya terminó o estamos limpiando la lista.
        // Pero si se requiere, se podría contar cuántos se borran e incrementar.
        return this.repository.deleteNoAsistieron(capacitacionId);
    }
}
