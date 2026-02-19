import { injectable, inject } from 'tsyringe';
import { Entidad, EntidadRepository } from '../../../domain/user/entidad.repository';

@injectable()
export class CreateEntidadUseCase {
    constructor(
        @inject('EntidadRepository') private entidadRepository: EntidadRepository
    ) { }

    async execute(data: Omit<Entidad, 'id'>): Promise<Entidad> {
        return await this.entidadRepository.create(data);
    }
}
