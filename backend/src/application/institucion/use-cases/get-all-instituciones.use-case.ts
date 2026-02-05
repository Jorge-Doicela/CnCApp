import { injectable, inject } from 'tsyringe';
import { InstitucionRepository } from '../../../domain/institucion/repositories/institucion.repository';

@injectable()
export class GetAllInstitucionesUseCase {
    constructor(
        @inject('InstitucionRepository') private institucionRepository: InstitucionRepository
    ) { }

    async execute(): Promise<any[]> {
        return this.institucionRepository.findAll();
    }
}
