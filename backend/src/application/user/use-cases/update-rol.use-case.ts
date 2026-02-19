import { injectable } from 'tsyringe';
import { Rol } from '../../../domain/user/rol.repository';

@injectable()
export class UpdateRolUseCase {
    constructor() { }

    async execute(id: number, rol: Partial<Rol>): Promise<Rol> {
        const { container } = require('tsyringe');
        const rolRepository = container.resolve('RolRepository');
        return await rolRepository.update(id, rol);
    }
}
