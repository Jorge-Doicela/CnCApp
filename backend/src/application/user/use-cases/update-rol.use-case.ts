import { injectable, inject } from 'tsyringe';
import { Rol, RolRepository } from '../../../domain/user/rol.repository';

@injectable()
export class UpdateRolUseCase {
    constructor(
        @inject('RolRepository') private rolRepository: RolRepository
    ) { }

    async execute(id: number, rol: Partial<Rol>): Promise<Rol> {
        return await this.rolRepository.update(id, rol);
    }
}
