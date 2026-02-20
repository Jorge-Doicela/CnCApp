import { injectable, inject } from 'tsyringe';
import { CantonRepository } from '../../../domain/ubicacion/repositories/canton.repository';

@injectable()
export class UpdateCantonUseCase {
    constructor(
        @inject('CantonRepository') private cantonRepository: CantonRepository
    ) { }

    async execute(id: number, data: any): Promise<any> {
        return this.cantonRepository.update(id, data);
    }
}
