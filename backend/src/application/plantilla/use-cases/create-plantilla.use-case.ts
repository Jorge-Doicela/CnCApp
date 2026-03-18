
import { inject, injectable } from 'tsyringe';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';
import { Plantilla } from '../../../domain/plantilla/plantilla.entity';
import { FileStorageService } from '../../../infrastructure/services/file-storage.service';

@injectable()
export class CreatePlantillaUseCase {
    constructor(
        @inject('PlantillaRepository') private repository: PlantillaRepository,
        @inject(FileStorageService) private fileStorageService: FileStorageService
    ) { }

    async execute(plantilla: Partial<Plantilla>): Promise<Plantilla> {
        if (plantilla.imagenUrl) {
            plantilla.imagenUrl = await this.fileStorageService.saveBase64(plantilla.imagenUrl, 'plantillas');
        }

        if (plantilla.activa) {
            await this.repository.desactivarTodas();
        }
        return await this.repository.create(plantilla);
    }
}
