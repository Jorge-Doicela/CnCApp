import { injectable } from 'tsyringe';
import { Entidad } from '../../../domain/user/entidad.repository';

@injectable()
export class CreateEntidadUseCase {
    constructor() { }

    async execute(data: Omit<Entidad, 'id'>): Promise<Entidad> {
        const { container } = require('tsyringe');
        const entidadRepository = container.resolve('EntidadRepository');
        return await entidadRepository.create(data);
    }
}
