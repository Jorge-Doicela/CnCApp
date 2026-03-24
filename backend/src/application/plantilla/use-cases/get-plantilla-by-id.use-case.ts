
import { inject, injectable } from 'tsyringe';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';
import { Plantilla } from '../../../domain/plantilla/plantilla.entity';
import { FileStorageService } from '../../../infrastructure/services/file-storage.service';

@injectable()
export class GetPlantillaByIdUseCase {
    constructor(
        @inject('PlantillaRepository') private repository: PlantillaRepository,
        @inject(FileStorageService) private fileStorageService: FileStorageService
    ) { }

    async execute(id: number): Promise<Plantilla | null> {
        const p = await this.repository.findById(id);
        if (p && p.imagenUrl && p.base64Imagen) {
            this.fileStorageService.restoreBase64(p.imagenUrl, p.base64Imagen);
        }
        return p;
    }
}
