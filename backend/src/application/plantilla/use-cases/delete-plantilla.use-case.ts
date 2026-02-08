
import { inject, injectable } from 'tsyringe';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';

@injectable()
export class DeletePlantillaUseCase {
    constructor(
        @inject('PlantillaRepository') private repository: PlantillaRepository
    ) { }

    async execute(id: number): Promise<void> {
        const plantilla = await this.repository.findById(id);
        if (plantilla?.activa) {
            throw new Error('No se puede eliminar la plantilla activa');
        }
        await this.repository.delete(id);
    }
}
