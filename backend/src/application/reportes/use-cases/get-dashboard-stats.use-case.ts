import { injectable, inject } from 'tsyringe';
import { ReportesRepository, DashboardStatsData } from '../../../domain/reportes/repositories/reportes.repository';

@injectable()
export class GetDashboardStatsUseCase {
    constructor(
        @inject('ReportesRepository') private readonly reportesRepository: ReportesRepository
    ) { }

    async execute(): Promise<DashboardStatsData> {
        return this.reportesRepository.getDashboardStats();
    }
}
