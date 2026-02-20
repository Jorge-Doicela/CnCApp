import { injectable, inject } from 'tsyringe';
import { ParroquiaRepository } from '../../../domain/ubicacion/repositories/parroquia.repository';

@injectable()
export class DeleteParroquiaUseCase {
    constructor(
        @inject('ParroquiaRepository') private parroquiaRepository: ParroquiaRepository
    ) { }

    async execute(id: number): Promise<void> {
        await this.parroquiaRepository.delete(id);
    }
}
