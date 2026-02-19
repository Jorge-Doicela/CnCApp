import { injectable, inject } from 'tsyringe';
import { Entidad, EntidadRepository } from '../../../domain/user/entidad.repository';

@injectable()
export class GetEntidadByIdUseCase {
    constructor(
        @inject('EntidadRepository') private entidadRepository: EntidadRepository
    ) { }

    async execute(id: number): Promise<Entidad | null> {
        return await this.entidadRepository.findById(id);
    }
}
