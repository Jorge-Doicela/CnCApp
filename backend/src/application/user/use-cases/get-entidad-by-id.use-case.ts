import { injectable } from 'tsyringe';
import { Entidad } from '../../../domain/user/entidad.repository';

@injectable()
export class GetEntidadByIdUseCase {
    constructor() { }

    async execute(id: number): Promise<Entidad | null> {
        const { container } = require('tsyringe');
        const entidadRepository = container.resolve('EntidadRepository');
        return await entidadRepository.findById(id);
    }
}
