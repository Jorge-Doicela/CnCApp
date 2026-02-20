import { injectable, inject } from 'tsyringe';
import { ProvinciaRepository } from '../../../domain/ubicacion/repositories/provincia.repository';

@injectable()
export class UpdateProvinciaUseCase {
    constructor(
        @inject('ProvinciaRepository') private provinciaRepository: ProvinciaRepository
    ) { }

    async execute(id: number, data: any): Promise<any> {
        return this.provinciaRepository.update(id, data);
    }
}
