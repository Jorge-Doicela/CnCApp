import { injectable, inject } from 'tsyringe';
import { InstitucionRepository } from '../../../domain/institucion/repositories/institucion.repository';

@injectable()
export class DeleteInstitucionUseCase {
    constructor(
        @inject('InstitucionRepository') private institucionRepository: InstitucionRepository
    ) { }

    async execute(id: number): Promise<boolean> {
        return this.institucionRepository.delete(id);
    }
}
