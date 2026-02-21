import { inject, injectable } from 'tsyringe';
import { CompetenciaRepository } from '../../../domain/competencia/repositories/competencia.repository';


@injectable()
export class CreateCompetenciaUseCase {
    constructor(
        @inject('CompetenciaRepository') private competenciaRepository: CompetenciaRepository
    ) { }

    async execute(data: any): Promise<any> {
        return this.competenciaRepository.create(data);
    }
}
