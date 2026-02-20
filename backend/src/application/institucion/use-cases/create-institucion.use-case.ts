import { injectable, inject } from 'tsyringe';
import { InstitucionRepository } from '../../../domain/institucion/repositories/institucion.repository';

@injectable()
export class CreateInstitucionUseCase {
    constructor(
        @inject('InstitucionRepository') private institucionRepository: InstitucionRepository
    ) { }

    async execute(data: any): Promise<any> {
        return this.institucionRepository.create(data);
    }
}
