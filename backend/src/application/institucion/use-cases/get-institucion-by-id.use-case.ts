import { injectable, inject } from 'tsyringe';
import { InstitucionRepository } from '../../../domain/institucion/repositories/institucion.repository';

@injectable()
export class GetInstitucionByIdUseCase {
    constructor(
        @inject('InstitucionRepository') private institucionRepository: InstitucionRepository
    ) { }

    async execute(id: number): Promise<any | null> {
        return this.institucionRepository.findById(id);
    }
}
