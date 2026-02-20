import { injectable, inject } from 'tsyringe';
import { ParroquiaRepository } from '../../../domain/ubicacion/repositories/parroquia.repository';

@injectable()
export class UpdateParroquiaUseCase {
    constructor(
        @inject('ParroquiaRepository') private parroquiaRepository: ParroquiaRepository
    ) { }

    async execute(id: number, data: any): Promise<any> {
        return this.parroquiaRepository.update(id, data);
    }
}
