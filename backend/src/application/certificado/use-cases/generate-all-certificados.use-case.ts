import { injectable, inject } from 'tsyringe';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';
import { GenerateCertificadoUseCase } from './generate-certificado.use-case';

@injectable()
export class GenerateAllCertificadosUseCase {
    constructor(
        @inject('UsuarioCapacitacionRepository') private usuarioCapacitacionRepository: UsuarioCapacitacionRepository,
        @inject(GenerateCertificadoUseCase) private generateCertificadoUseCase: GenerateCertificadoUseCase
    ) { }

    async execute(capacitacionId: number): Promise<void> {
        // Encontrar todos los asistentes (que marcaron asistencia)
        const participantes = await this.usuarioCapacitacionRepository.findByCapacitacionId(capacitacionId);

        // Filtrar a los que asistieron (aunque supuestamente ya se borraron los que no)
        const asistentes = participantes.filter(p => p.asistio === true);

        // Generar un certificado para cada asistente en paralelo (o en serie para evitar desborde de memoria)
        for (const asistente of asistentes) {
            try {
                await this.generateCertificadoUseCase.execute(asistente.usuarioId, capacitacionId);
            } catch (error) {
                console.error(`Error generando certificado para usuario ${asistente.usuarioId}:`, error);
                // Si falla un certificado, registrar error pero continuar con los demás
            }
        }
    }
}
