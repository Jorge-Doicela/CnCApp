import { injectable, inject } from 'tsyringe';
import { MancomunidadRepository } from '../../../domain/mancomunidad/repositories/mancomunidad.repository';

@injectable()
export class CreateMancomunidadUseCase {
    constructor(@inject('MancomunidadRepository') private repository: MancomunidadRepository) { }
    async execute(nombre: string) { return await this.repository.create(nombre); }
}
