import { injectable, inject } from 'tsyringe';
import { EntidadRepository } from '../../../domain/user/entidad.repository';

@injectable()
export class DeleteEntidadUseCase {
    constructor(
        @inject('EntidadRepository') private entidadRepository: EntidadRepository
    ) { }

    async execute(id: number): Promise<void> {
        return await this.entidadRepository.delete(id);
    }
}
