import { injectable, inject } from 'tsyringe';
import { CantonRepository } from '../../../domain/ubicacion/repositories/canton.repository';

@injectable()
export class DeleteCantonUseCase {
    constructor(
        @inject('CantonRepository') private cantonRepository: CantonRepository
    ) { }

    async execute(id: number): Promise<void> {
        await this.cantonRepository.delete(id);
    }
}
