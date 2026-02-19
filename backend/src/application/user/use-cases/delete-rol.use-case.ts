import { injectable } from 'tsyringe';

@injectable()
export class DeleteRolUseCase {
    constructor() { }

    async execute(id: number): Promise<void> {
        const { container } = require('tsyringe');
        const rolRepository = container.resolve('RolRepository');
        await rolRepository.delete(id);
    }
}
