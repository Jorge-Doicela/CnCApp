import { injectable, inject } from 'tsyringe';
import { GradoOcupacionalRepository } from '../../../domain/grado-ocupacional/repositories/grado-ocupacional.repository';

@injectable()
export class UpdateGradoUseCase {
    constructor(
        @inject('GradoOcupacionalRepository') private repository: GradoOcupacionalRepository
    ) { }

    async execute(id: number, nombre: string) {
        return await this.repository.update(id, nombre);
    }
}
