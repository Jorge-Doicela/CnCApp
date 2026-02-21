import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetDashboardStatsUseCase } from '../../../application/reportes/use-cases/get-dashboard-stats.use-case';
import { ExportarPDFUseCase } from '../../../application/reportes/use-cases/exportar-pdf.use-case';

@injectable()
export class ReportesController {
    constructor(
        @inject(GetDashboardStatsUseCase) private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
        @inject(ExportarPDFUseCase) private readonly exportarPDFUseCase: ExportarPDFUseCase
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

    exportPDF = async (_req: Request, res: Response): Promise<void> => {
        try {
            const pdfBuffer = await this.exportarPDFUseCase.execute();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte-dashboard.pdf');
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            res.status(500).json({
                success: false,
                error: 'Error al exportar reporte PDF'
            });
        }
    };
}
