import { inject, injectable } from 'tsyringe';
import { ProvinciaRepository } from '../../../domain/ubicacion/repositories/provincia.repository';

@injectable()
export class GetProvinciasUseCase {
    constructor(
        @inject('ProvinciaRepository') private provinciaRepository: ProvinciaRepository
    ) { }

    async execute(): Promise<any[]> {
        return this.provinciaRepository.findAll();
    }
}
