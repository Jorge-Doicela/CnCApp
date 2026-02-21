import { inject, injectable } from 'tsyringe';
import { CompetenciaRepository } from '../../../domain/competencia/repositories/competencia.repository';

@injectable()
export class DeleteCompetenciaUseCase {
    constructor(
        @inject('CompetenciaRepository') private competenciaRepository: CompetenciaRepository
    ) { }

    async execute(id: number): Promise<void> {
        await this.competenciaRepository.delete(id);
    }
}
