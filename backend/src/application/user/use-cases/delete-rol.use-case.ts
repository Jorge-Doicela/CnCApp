import { injectable, inject } from 'tsyringe';
import { RolRepository } from '../../../domain/user/rol.repository';
import prisma from '../../../config/database';

@injectable()
export class DeleteRolUseCase {
    constructor(
        @inject('RolRepository') private rolRepository: RolRepository
    ) { }

    async execute(id: number): Promise<void> {
        // Prevent deletion if users exist with this role
        const usersCount = await prisma.usuario.count({ where: { rolId: id } });
        if (usersCount > 0) {
            throw new Error(`No se puede eliminar este rol porque está asignado a ${usersCount} usuario(s). Por favor reasígnelos primero.`);
        }

        await this.rolRepository.delete(id);
    }
}
