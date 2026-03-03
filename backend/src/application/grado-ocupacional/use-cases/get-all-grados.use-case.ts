import { injectable, inject } from 'tsyringe';
import { GradoOcupacionalRepository } from '../../../domain/grado-ocupacional/repositories/grado-ocupacional.repository';

@injectable()
export class GetAllGradosUseCase {
    constructor(
        @inject('GradoOcupacionalRepository') private repository: GradoOcupacionalRepository
    ) { }

    async execute() {
        return await this.repository.findAll();
    }
}
