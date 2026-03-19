
import { inject, injectable } from 'tsyringe';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';

import { FileStorageService } from '../../../infrastructure/services/file-storage.service';

@injectable()
export class DeletePlantillaUseCase {
    constructor(
        @inject('PlantillaRepository') private repository: PlantillaRepository,
        @inject(FileStorageService) private fileStorageService: FileStorageService
    ) { }

    async execute(id: number): Promise<void> {
        const plantilla = await this.repository.findById(id);
        if (plantilla?.activa) {
            throw new Error('No se puede eliminar la plantilla activa');
        }
        if (plantilla?.imagenUrl) {
            await this.fileStorageService.deleteFile(plantilla.imagenUrl);
        }
        await this.repository.delete(id);
    }
}
