import { injectable, inject } from 'tsyringe';
import { GradoOcupacionalRepository } from '../../../domain/grado-ocupacional/repositories/grado-ocupacional.repository';

@injectable()
export class CreateGradoUseCase {
    constructor(
        @inject('GradoOcupacionalRepository') private repository: GradoOcupacionalRepository
    ) { }

    async execute(nombre: string) {
        return await this.repository.create(nombre);
    }
}
