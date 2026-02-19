import { injectable, inject } from 'tsyringe';
import { Rol, RolRepository } from '../../../domain/user/rol.repository';

@injectable()
export class GetRolByIdUseCase {
    constructor(
        @inject('RolRepository') private rolRepository: RolRepository
    ) { }

    async execute(id: number): Promise<Rol | null> {
        return await this.rolRepository.findById(id);
    }
}
