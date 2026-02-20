import { injectable, inject } from 'tsyringe';
import { ProvinciaRepository } from '../../../domain/ubicacion/repositories/provincia.repository';

@injectable()
export class DeleteProvinciaUseCase {
    constructor(
        @inject('ProvinciaRepository') private provinciaRepository: ProvinciaRepository
    ) { }

    async execute(id: number): Promise<void> {
        await this.provinciaRepository.delete(id);
    }
}
