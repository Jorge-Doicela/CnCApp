
import { inject, injectable } from 'tsyringe';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';
import { Plantilla } from '../../../domain/plantilla/plantilla.entity';

@injectable()
export class UpdatePlantillaUseCase {
    constructor(
        @inject('PlantillaRepository') private repository: PlantillaRepository
    ) { }

    async execute(id: number, data: Partial<Plantilla>): Promise<Plantilla> {
        if (data.activa) {
            await this.repository.desactivarTodas();
        }
        return await this.repository.update(id, data);
    }
}
