import { injectable, inject } from 'tsyringe';
import { InstitucionRepository } from '../../../domain/institucion/repositories/institucion.repository';

@injectable()
export class UpdateInstitucionUseCase {
    constructor(
        @inject('InstitucionRepository') private institucionRepository: InstitucionRepository
    ) { }

    async execute(id: number, data: any): Promise<any> {
        return this.institucionRepository.update(id, data);
    }
}
