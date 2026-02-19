import { injectable, inject } from 'tsyringe';
import { RolRepository } from '../../../domain/user/rol.repository';

@injectable()
export class DeleteRolUseCase {
    constructor(
        @inject('RolRepository') private rolRepository: RolRepository
    ) { }

    async execute(id: number): Promise<void> {
        await this.rolRepository.delete(id);
    }
}
