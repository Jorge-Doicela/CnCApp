import { injectable, inject } from 'tsyringe';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';
import { Capacitacion } from '../../../domain/capacitacion/entities/capacitacion.entity';
import { NotFoundError, ValidationError } from '../../../domain/shared/errors';
import { EstadoCapacitacionEnum } from '../../../domain/shared/constants/enums';
import { GenerateAllCertificadosUseCase } from '../../certificado/use-cases/generate-all-certificados.use-case';

@injectable()
export class UpdateCapacitacionUseCase {
    constructor(
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository,
        @inject(GenerateAllCertificadosUseCase) private generateAllUseCase: GenerateAllCertificadosUseCase
    ) { }

    async execute(id: number, data: Partial<Capacitacion>): Promise<Capacitacion> {
        const current = await this.capacitacionRepository.findById(id);
        if (!current) {
            throw new NotFoundError('Capacitación no encontrada');
        }

        // 1. Validar fechas (comparando con los datos actuales si no vienen en el payload)
        const fechaInicio = data.fechaInicio || current.fechaInicio;
        const fechaFin = data.fechaFin || current.fechaFin;

        if (fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            if (fin < inicio) {
                throw new ValidationError('La fecha de finalización no puede ser anterior a la fecha de inicio');
            }
        }

        // 2. Validar nombre duplicado si el nombre está cambiando
        if (data.nombre && data.nombre.trim().toLowerCase() !== current.nombre.toLowerCase()) {
            const existing = await this.capacitacionRepository.findByNombre(data.nombre, id);
            if (existing) {
                throw new ValidationError(`Ya existe otra capacitación con el nombre "${data.nombre}"`);
            }
        }

        const updated = await this.capacitacionRepository.update(id, data);

        // 3. Si el estado cambia a FINALIZADA (Realizada), disparar generación de certificados automáticamente
        if (data.estado === EstadoCapacitacionEnum.REALIZADA && current.estado !== EstadoCapacitacionEnum.REALIZADA) {
            // Solo si no se han emitido ya
            if (!updated.certificado) {
                // Ejecución asíncrona para no bloquear la respuesta principal
                this.generateAllUseCase.execute(id).then(async () => {
                    // Marcar como certificado=true tras el éxito
                    await this.capacitacionRepository.update(id, { certificado: true });
                }).catch(err => {
                    console.error(`[UNIFIED_CERT] Error en generación automática para ID=${id}:`, err);
                });
            }
        }

        return updated;
    }
}
