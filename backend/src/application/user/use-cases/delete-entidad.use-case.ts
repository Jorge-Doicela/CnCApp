import { injectable } from 'tsyringe';

@injectable()
export class DeleteEntidadUseCase {
    constructor() { }

    async execute(id: number): Promise<void> {
        const { container } = require('tsyringe');
        const entidadRepository = container.resolve('EntidadRepository');
        return await entidadRepository.delete(id);
    }
}
