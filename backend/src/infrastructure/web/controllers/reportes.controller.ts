import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetDashboardStatsUseCase } from '../../../application/reportes/use-cases/get-dashboard-stats.use-case';
import { ExportarPDFUseCase } from '../../../application/reportes/use-cases/exportar-pdf.use-case';

@injectable()
export class ReportesController {
    constructor(
        @inject(GetDashboardStatsUseCase) private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
        @inject(ExportarPDFUseCase) private readonly exportarPDFUseCase: ExportarPDFUseCase
    ) { }

    getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { startDate, endDate, entidadId, modalidad } = req.query;
            
            const filter = {
                startDate: startDate as string,
                endDate: endDate as string,
                entidadId: entidadId ? parseInt(entidadId as string) : undefined,
                modalidad: modalidad as string
            };

            const stats = await this.getDashboardStatsUseCase.execute(filter);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    };

    exportPDF = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const pdfBuffer = await this.exportarPDFUseCase.execute();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte-dashboard.pdf');
            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    };
}
