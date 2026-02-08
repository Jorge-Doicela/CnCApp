
import { inject, injectable } from 'tsyringe';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';
import { Plantilla } from '../../../domain/plantilla/plantilla.entity';

@injectable()
export class CreatePlantillaUseCase {
    constructor(
        @inject('PlantillaRepository') private repository: PlantillaRepository
    ) { }

    async execute(plantilla: Partial<Plantilla>): Promise<Plantilla> {
        if (plantilla.activa) {
            await this.repository.desactivarTodas();
        }
        return await this.repository.create(plantilla);
    }
}
