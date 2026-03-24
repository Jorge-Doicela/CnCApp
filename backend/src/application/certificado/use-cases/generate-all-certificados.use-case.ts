import { injectable, inject } from 'tsyringe';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';
import { GenerateCertificadoUseCase } from './generate-certificado.use-case';

@injectable()
export class GenerateAllCertificadosUseCase {
    constructor(
        @inject('UsuarioCapacitacionRepository') private usuarioCapacitacionRepository: UsuarioCapacitacionRepository,
        @inject(GenerateCertificadoUseCase) private generateCertificadoUseCase: GenerateCertificadoUseCase
    ) { }

    async execute(capacitacionId: number, force: boolean = false): Promise<{ success: number; failed: number; errors: string[] }> {
        const result = { success: 0, failed: 0, errors: [] as string[] };
        
        // Encontrar todos los asistentes (que marcaron asistencia)
        const participantes = await this.usuarioCapacitacionRepository.findByCapacitacionId(capacitacionId);

        // Filtrar a los que asistieron
        const asistentes = participantes.filter(p => p.asistio === true);

        if (asistentes.length === 0) {
            throw new Error('No hay participantes con asistencia confirmada para generar certificados');
        }

        // Generar un certificado para cada asistente
        for (const asistente of asistentes) {
            try {
                await this.generateCertificadoUseCase.execute(asistente.usuarioId, capacitacionId, force);
                result.success++;
            } catch (error: any) {
                const errorMsg = `Usuario ${asistente.usuarioId}: ${error.message || error}`;
                console.error(`Error generando certificado:`, errorMsg);
                result.failed++;
                result.errors.push(errorMsg);
            }
        }

        return result;
    }
}
