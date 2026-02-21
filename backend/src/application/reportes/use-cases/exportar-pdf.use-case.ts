import { injectable, inject } from 'tsyringe';
import PDFDocument from 'pdfkit';
import { GetDashboardStatsUseCase } from './get-dashboard-stats.use-case';

@injectable()
export class ExportarPDFUseCase {
    constructor(
        @inject(GetDashboardStatsUseCase) private getDashboardStatsUseCase: GetDashboardStatsUseCase
    ) { }

    async execute(): Promise<Buffer> {
        const stats = await this.getDashboardStatsUseCase.execute();

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            // Report Header
            doc.fontSize(20).text('Reporte de Estadísticas del Sistema', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Fecha de generación: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown(2);

            // KPI Section
            doc.fontSize(16).text('Indicadores Clave (KPIs)', { underline: true });
            doc.moveDown();
            doc.fontSize(12).text(`• Usuarios Totales: ${stats.totalUsuarios}`);
            doc.text(`• Certificados Emitidos: ${stats.totalCertificados}`);
            doc.text(`• Capacitaciones Totales: ${stats.totalCapacitaciones}`);
            doc.text(`• Registros este Mes: ${stats.usuariosRegistradosEsteMes}`);
            doc.moveDown(2);

            // Activities Section
            doc.fontSize(16).text('Resumen de Actividades', { underline: true });
            doc.moveDown();
            doc.fontSize(12).text(`• Capacitaciones Activas: ${stats.capacitacionesActivas}`);
            doc.text(`• Capacitaciones Finalizadas: ${stats.capacitacionesFinalizadas}`);
            doc.text(`• Certificados este Mes: ${stats.certificadosEsteMes}`);
            doc.moveDown(2);

            // Footer
            doc.fontSize(10).text('Consejo Nacional de Competencias - Sistema de Gestión', { align: 'center' });

            doc.end();
        });
    }
}
