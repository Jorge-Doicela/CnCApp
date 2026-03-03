import { injectable, inject } from 'tsyringe';
import { MancomunidadRepository } from '../../../domain/mancomunidad/repositories/mancomunidad.repository';

@injectable()
export class GetAllMancomunidadesUseCase {
    constructor(@inject('MancomunidadRepository') private repository: MancomunidadRepository) { }
    async execute() { return await this.repository.findAll(); }
}
