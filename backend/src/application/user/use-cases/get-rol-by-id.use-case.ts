import { injectable } from 'tsyringe';
import { Rol } from '../../../domain/user/rol.repository';

@injectable()
export class GetRolByIdUseCase {
    constructor() { }

    async execute(id: number): Promise<Rol | null> {
        const { container } = require('tsyringe');
        const rolRepository = container.resolve('RolRepository');
        return await rolRepository.findById(id);
    }
}
