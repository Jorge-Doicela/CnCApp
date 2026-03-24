
import { inject, injectable } from 'tsyringe';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';
import { Plantilla } from '../../../domain/plantilla/plantilla.entity';
import { FileStorageService } from '../../../infrastructure/services/file-storage.service';

@injectable()
export class GetAllPlantillasUseCase {
    constructor(
        @inject('PlantillaRepository') private repository: PlantillaRepository,
        @inject(FileStorageService) private fileStorageService: FileStorageService
    ) { }

    async execute(): Promise<Plantilla[]> {
        const plantillas = await this.repository.findAll();
        
        // Restore missing images from base64 backup
        for (const p of plantillas) {
            if (p.imagenUrl && p.base64Imagen) {
                this.fileStorageService.restoreBase64(p.imagenUrl, p.base64Imagen);
            }
        }
        
        return plantillas;
    }
}
