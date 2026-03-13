import { injectable, inject } from 'tsyringe';
import { ReportesRepository, DashboardStatsData, DashboardFilter } from '../../../domain/reportes/repositories/reportes.repository';

@injectable()
export class GetDashboardStatsUseCase {
    constructor(
        @inject('ReportesRepository') private readonly reportesRepository: ReportesRepository
    ) { }

    async execute(filter?: DashboardFilter): Promise<DashboardStatsData> {
        return this.reportesRepository.getDashboardStats(filter);
    }
}
