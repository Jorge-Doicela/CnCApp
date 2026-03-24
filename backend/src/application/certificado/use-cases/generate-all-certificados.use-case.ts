import { injectable, inject } from 'tsyringe';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';
import { GenerateCertificadoUseCase } from './generate-certificado.use-case';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';
import { CertificateGeneratorService } from '../../../infrastructure/services/certificate-generator.service';
import logger from '../../../config/logger';

@injectable()
export class GenerateAllCertificadosUseCase {
    constructor(
        @inject('UsuarioCapacitacionRepository') private usuarioCapacitacionRepository: UsuarioCapacitacionRepository,
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository,
        @inject('PlantillaRepository') private plantillaRepository: PlantillaRepository,
        @inject(GenerateCertificadoUseCase) private generateCertificadoUseCase: GenerateCertificadoUseCase,
        @inject(CertificateGeneratorService) private generatorService: CertificateGeneratorService
    ) { }

    async execute(capacitacionId: number, force: boolean = false): Promise<{ success: number; failed: number; errors: string[] }> {
        const result = { success: 0, failed: 0, errors: [] as string[] };
        
        logger.info(`[GEN_ALL] Iniciando generación masiva para Capacitación ID=${capacitacionId}`);

        // 1. Fetch Shared Resources
        const capacitacion = await this.capacitacionRepository.findById(capacitacionId);
        if (!capacitacion) throw new Error(`Capacitación ID=${capacitacionId} no encontrada`);

        const capAny = capacitacion as any;
        if (!capAny.plantillaId) throw new Error('La capacitación no tiene una plantilla asignada');

        const plantilla = await this.plantillaRepository.findById(capAny.plantillaId);
        if (!plantilla) throw new Error(`Plantilla ID=${capAny.plantillaId} no encontrada`);

        // Pre-fetch background buffer
        const backgroundBuffer = plantilla.imagenUrl ? await this.generatorService.fetchImageBuffer(plantilla.imagenUrl) : null;
        
        // 2. Find Attendees
        const participantes = await this.usuarioCapacitacionRepository.findByCapacitacionId(capacitacionId);
        const asistentes = participantes.filter(p => p.asistio === true);

        if (asistentes.length === 0) {
            throw new Error('No hay participantes con asistencia confirmada para generar certificados');
        }

        logger.info(`[GEN_ALL] Procesando ${asistentes.length} certificados...`);

        // 3. Process in Parallel Batches
        const BATCH_SIZE = 5;
        for (let i = 0; i < asistentes.length; i += BATCH_SIZE) {
            const batch = asistentes.slice(i, i + BATCH_SIZE);
            
            await Promise.all(batch.map(async (asistente) => {
                try {
                    await this.generateCertificadoUseCase.execute(asistente.usuarioId, capacitacionId, force, {
                        capacitacion,
                        plantilla,
                        backgroundBuffer: backgroundBuffer || undefined
                    });
                    result.success++;
                } catch (error: any) {
                    const errorMsg = `Usuario ${asistente.usuarioId}: ${error.message || error}`;
                    logger.error(`[GEN_ALL] Error: ${errorMsg}`);
                    result.failed++;
                    result.errors.push(errorMsg);
                }
            }));

            logger.info(`[GEN_ALL] Progreso: ${Math.min(i + BATCH_SIZE, asistentes.length)}/${asistentes.length}`);
        }

        logger.info(`[GEN_ALL] Finalizado. Éxito: ${result.success}, Fallidos: ${result.failed}`);
        return result;
    }
}
