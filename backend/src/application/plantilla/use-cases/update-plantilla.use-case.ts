
import { inject, injectable } from 'tsyringe';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';
import { Plantilla } from '../../../domain/plantilla/plantilla.entity';
import { FileStorageService } from '../../../infrastructure/services/file-storage.service';

@injectable()
export class UpdatePlantillaUseCase {
    constructor(
        @inject('PlantillaRepository') private repository: PlantillaRepository,
        @inject(FileStorageService) private fileStorageService: FileStorageService
    ) { }

    async execute(id: number, data: Partial<Plantilla>): Promise<Plantilla> {
        if (data.imagenUrl) {
            data.imagenUrl = await this.fileStorageService.saveBase64(data.imagenUrl, 'plantillas');
        }

        if (data.activa) {
            await this.repository.desactivarTodas();
        }
        return await this.repository.update(id, data);
    }
}
