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

            // Report Header with Color
            doc.rect(0, 0, doc.page.width, 100).fill('#1a3a5a');
            doc.fillColor('#ffffff').fontSize(24).text('CONSEJO NACIONAL DE COMPETENCIAS', 50, 40, { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(14).text('REPORTE EJECUTIVO DE ESTADÍSTICAS', { align: 'center' });
            
            doc.fillColor('#000000').moveDown(4);

            doc.fontSize(10).text(`Fecha de generación: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown(2);

            // KPI Section
            doc.fillColor('#1a3a5a').fontSize(18).text('Indicadores Clave (KPIs)', { underline: true });
            doc.fillColor('#000000').moveDown();
            
            const kpiData = [
                { label: 'Usuarios Registrados', value: stats.totalUsuarios },
                { label: 'Certificados Emitidos', value: stats.totalCertificados },
                { label: 'Capacitaciones Totales', value: stats.totalCapacitaciones },
                { label: 'Nuevos Usuarios (Este Mes)', value: stats.usuariosRegistradosEsteMes }
            ];

            kpiData.forEach(item => {
                doc.fontSize(12).font('Helvetica-Bold').text(`${item.label}: `, { continued: true })
                   .font('Helvetica').text(`${item.value}`);
            });
            doc.moveDown(2);

            // Distribution Table
            doc.fillColor('#1a3a5a').fontSize(18).text('Distribución de Usuarios por Rol', { underline: true });
            doc.fillColor('#000000').moveDown();

            stats.usuariosPorRol.forEach(rol => {
                doc.fontSize(12).font('Helvetica').text(`• ${rol.nombre}: `, { continued: true })
                   .font('Helvetica-Bold').text(`${rol.cantidad} usuarios`);
            });
            doc.moveDown(2);

            // Activities Section
            doc.fillColor('#1a3a5a').fontSize(18).text('Resumen de Capacitaciones', { underline: true });
            doc.fillColor('#000000').moveDown();
            doc.fontSize(12).font('Helvetica').text(`Actualmente existen `, { continued: true })
               .font('Helvetica-Bold').text(`${stats.capacitacionesActivas} capacitaciones activas`, { continued: true })
               .font('Helvetica').text(` y un histórico de `)
               .font('Helvetica-Bold').text(`${stats.capacitacionesFinalizadas} capacitaciones finalizadas.`);
            
            doc.moveDown();
            doc.font('Helvetica').text(`En el presente mes se han emitido `)
               .font('Helvetica-Bold').text(`${stats.certificadosEsteMes} nuevos certificados.`);

            // Footer
            const pageHeight = doc.page.height;
            doc.fontSize(8).fillColor('#888888').text('Este documento es un reporte automático generado por el Sistema de Gestión del CNC.', 0, pageHeight - 60, { align: 'center' });
            doc.text(`Generado por el módulo de Reportes Administrativos - v1.0`, { align: 'center' });

            doc.end();
        });
    }
}
