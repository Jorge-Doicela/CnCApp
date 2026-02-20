import { injectable, inject } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import { ReportesRepository, DashboardStatsData, DashboardStatsTrend } from '../../../../domain/reportes/repositories/reportes.repository';

@injectable()
export class PrismaReportesRepository implements ReportesRepository {
    constructor(
        @inject('PrismaClient') private readonly prisma: PrismaClient
    ) { }

    async getDashboardStats(): Promise<DashboardStatsData> {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            totalUsuarios,
            totalCapacitaciones,
            totalCertificados,
            usuariosPorRol,
            capacitacionesActivas,
            capacitacionesFinalizadas,
            certificadosEsteMes,
            usuariosRegistradosEsteMes,
            tendencias
        ] = await Promise.all([
            this.prisma.usuario.count(),
            this.prisma.capacitacion.count(),
            this.prisma.certificado.count(),
            this.getUsuariosPorRolData(),
            this.prisma.capacitacion.count({
                where: {
                    fechaInicio: { lte: now },
                    fechaFin: { gte: now }
                }
            }),
            this.prisma.capacitacion.count({
                where: {
                    fechaFin: { lt: now }
                }
            }),
            this.prisma.certificado.count({
                where: {
                    fechaEmision: { gte: firstDayOfMonth }
                }
            }),
            this.prisma.usuario.count({
                where: {
                    createdAt: { gte: firstDayOfMonth }
                }
            }),
            this.getTendenciasData()
        ]);

        return {
            totalUsuarios,
            totalCapacitaciones,
            totalCertificados,
            usuariosPorRol,
            capacitacionesActivas,
            capacitacionesFinalizadas,
            certificadosEsteMes,
            usuariosRegistradosEsteMes,
            tendencias
        };
    }

    private async getTendenciasData(): Promise<DashboardStatsTrend[]> {
        const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        // Optimizamos obteniendo rangos de fechas de antemano
        const queries = [];
        for (let i = 5; i >= 0; i--) {
            const fecha = new Date();
            fecha.setMonth(fecha.getMonth() - i);
            const mesIndex = fecha.getMonth();
            const year = fecha.getFullYear();

            const startOfMonth = new Date(year, mesIndex, 1);
            const endOfMonth = new Date(year, mesIndex + 1, 0, 23, 59, 59);

            queries.push({
                mesLabel: `${mesesNombres[mesIndex]} ${year}`,
                start: startOfMonth,
                end: endOfMonth
            });
        }

        // Ejecutamos todos los conteos en paralelo
        const results = await Promise.all(queries.map(q =>
            Promise.all([
                this.prisma.usuario.count({
                    where: { createdAt: { gte: q.start, lte: q.end } }
                }),
                this.prisma.certificado.count({
                    where: { fechaEmision: { gte: q.start, lte: q.end } }
                })
            ])
        ));

        return queries.map((q, index) => ({
            mes: q.mesLabel,
            usuarios: results[index][0],
            certificados: results[index][1]
        }));
    }

    private async getUsuariosPorRolData() {
        const roles = await this.prisma.rol.findMany({
            include: {
                _count: {
                    select: { usuarios: true }
                }
            },
            orderBy: {
                nombre: 'asc'
            }
        });

        return roles.map(rol => ({
            nombre: rol.nombre,
            cantidad: rol._count.usuarios
        }));
    }
}
