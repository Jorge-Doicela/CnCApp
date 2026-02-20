import { injectable, inject } from 'tsyringe';
import { ParroquiaRepository } from '../../../domain/ubicacion/repositories/parroquia.repository';

@injectable()
export class GetParroquiasUseCase {
    constructor(
        @inject('ParroquiaRepository') private parroquiaRepository: ParroquiaRepository
    ) { }

    async execute(): Promise<any[]> {
        return this.parroquiaRepository.findAll();
    }
}
