import { injectable, inject } from 'tsyringe';
import { EncuestaRepository } from '../../domain/encuesta/repositories/encuesta.repository';
import { EncuestaRespuesta } from '@prisma/client';

@injectable()
export class SubmitEncuestaUseCase {
    constructor(
        @inject('EncuestaRepository') private encuestaRepository: EncuestaRepository
    ) {}

    async execute(data: any): Promise<EncuestaRespuesta> {
        // Verificar si ya respondió
        const alreadyResponded = await this.encuestaRepository.hasUserResponded(data.encuestaId, data.usuarioId);
        if (alreadyResponded) {
            throw new Error('Ya has completado esta encuesta');
        }

        return this.encuestaRepository.submitRespuesta(data);
    }
}
