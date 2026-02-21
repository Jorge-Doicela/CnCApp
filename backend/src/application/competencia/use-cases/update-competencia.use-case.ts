import { inject, injectable } from 'tsyringe';
import { CompetenciaRepository } from '../../../domain/competencia/repositories/competencia.repository';


@injectable()
export class UpdateCompetenciaUseCase {
    constructor(
        @inject('CompetenciaRepository') private competenciaRepository: CompetenciaRepository
    ) { }

    async execute(id: number, data: any): Promise<any> {
        return this.competenciaRepository.update(id, data);
    }
}
