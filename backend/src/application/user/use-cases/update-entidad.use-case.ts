import { injectable } from 'tsyringe';
import { Entidad } from '../../../domain/user/entidad.repository';

@injectable()
export class UpdateEntidadUseCase {
    constructor() { }

    async execute(id: number, data: Partial<Entidad>): Promise<Entidad> {
        const { container } = require('tsyringe');
        const entidadRepository = container.resolve('EntidadRepository');
        return await entidadRepository.update(id, data);
    }
}
