import { injectable, inject } from 'tsyringe';
import { Rol, RolRepository } from '../../../domain/user/rol.repository';

@injectable()
export class CreateRolUseCase {
    constructor(
        @inject('RolRepository') private rolRepository: RolRepository
    ) { }

    async execute(rol: Omit<Rol, 'id'>): Promise<Rol> {
        return await this.rolRepository.create(rol);
    }
}
