
import { inject, injectable } from 'tsyringe';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';
import { Plantilla } from '../../../domain/plantilla/plantilla.entity';

@injectable()
export class ActivarPlantillaUseCase {
    constructor(
        @inject('PlantillaRepository') private repository: PlantillaRepository
    ) { }

    async execute(id: number): Promise<Plantilla> {
        await this.repository.desactivarTodas();
        return await this.repository.activar(id);
    }
}
