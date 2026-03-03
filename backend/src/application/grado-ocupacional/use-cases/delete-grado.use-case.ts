import { injectable, inject } from 'tsyringe';
import { GradoOcupacionalRepository } from '../../../domain/grado-ocupacional/repositories/grado-ocupacional.repository';

@injectable()
export class DeleteGradoUseCase {
    constructor(
        @inject('GradoOcupacionalRepository') private repository: GradoOcupacionalRepository
    ) { }

    async execute(id: number) {
        return await this.repository.delete(id);
    }
}
