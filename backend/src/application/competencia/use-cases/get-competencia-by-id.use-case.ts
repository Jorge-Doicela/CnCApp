import { inject, injectable } from 'tsyringe';
import { CompetenciaRepository } from '../../../domain/competencia/repositories/competencia.repository';


@injectable()
export class GetCompetenciaByIdUseCase {
    constructor(
        @inject('CompetenciaRepository') private competenciaRepository: CompetenciaRepository
    ) { }

    async execute(id: number): Promise<any | null> {
        return this.competenciaRepository.findById(id);
    }
}
