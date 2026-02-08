
import { inject, injectable } from 'tsyringe';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';
import { Plantilla } from '../../../domain/plantilla/plantilla.entity';

@injectable()
export class GetAllPlantillasUseCase {
    constructor(
        @inject('PlantillaRepository') private repository: PlantillaRepository
    ) { }

    async execute(): Promise<Plantilla[]> {
        return await this.repository.findAll();
    }
}
