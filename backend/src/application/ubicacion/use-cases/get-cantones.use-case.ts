import { inject, injectable } from 'tsyringe';
import { CantonRepository } from '../../../domain/ubicacion/repositories/canton.repository';

@injectable()
export class GetCantonesUseCase {
    constructor(
        @inject('CantonRepository') private cantonRepository: CantonRepository
    ) { }

    async execute(): Promise<any[]> {
        return this.cantonRepository.findAll();
    }
}
