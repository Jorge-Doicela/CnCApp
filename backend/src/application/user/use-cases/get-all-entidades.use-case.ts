import { injectable, inject } from 'tsyringe';
import { Entidad, EntidadRepository } from '../../../domain/user/entidad.repository';

@injectable()
export class GetAllEntidadesUseCase {
    constructor(
        @inject('EntidadRepository') private entidadRepository: EntidadRepository
    ) { }

    async execute(): Promise<Entidad[]> {
        return await this.entidadRepository.findAll();
    }
}
