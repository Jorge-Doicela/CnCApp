import { injectable } from 'tsyringe';
import { Rol } from '../../../domain/user/rol.repository';

@injectable()
export class CreateRolUseCase {
    constructor() { }

    async execute(rol: Omit<Rol, 'id'>): Promise<Rol> {
        const { container } = require('tsyringe');
        const rolRepository = container.resolve('RolRepository');
        return await rolRepository.create(rol);
    }
}
