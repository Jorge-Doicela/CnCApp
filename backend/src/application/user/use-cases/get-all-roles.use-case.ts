import { injectable, inject } from 'tsyringe';
import { Rol, RolRepository } from '../../../domain/user/rol.repository';

@injectable()
export class GetAllRolesUseCase {
    constructor(
        @inject('RolRepository') private rolRepository: RolRepository
    ) { }

    async execute(): Promise<Rol[]> {
        return await this.rolRepository.findAll();
    }
}
