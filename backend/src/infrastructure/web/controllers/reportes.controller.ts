import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetDashboardStatsUseCase } from '../../../application/reportes/use-cases/get-dashboard-stats.use-case';

@injectable()
export class ReportesController {
    constructor(
        @inject(GetDashboardStatsUseCase) private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase
    ) { }

    getDashboard = async (_req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.getDashboardStatsUseCase.execute();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener estadísticas del dashboard'
            });
        }
    };
}
