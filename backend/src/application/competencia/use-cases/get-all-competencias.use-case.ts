import { inject, injectable } from 'tsyringe';
import { CompetenciaRepository } from '../../../domain/competencia/repositories/competencia.repository';


@injectable()
export class GetAllCompetenciasUseCase {
    constructor(
        @inject('CompetenciaRepository') private competenciaRepository: CompetenciaRepository
    ) { }

    async execute(): Promise<any[]> {
        return this.competenciaRepository.findAll();
    }
}
