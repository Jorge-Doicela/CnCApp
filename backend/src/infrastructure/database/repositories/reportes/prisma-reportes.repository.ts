import { injectable, inject } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import { ReportesRepository, DashboardStatsData, DashboardStatsTrend, DashboardFilter } from '../../../../domain/reportes/repositories/reportes.repository';
import { EstadoCapacitacionEnum } from '../../../../domain/shared/constants/enums';

@injectable()
export class PrismaReportesRepository implements ReportesRepository {
    constructor(
        @inject('PrismaClient') private readonly prisma: PrismaClient
    ) { }

    async getDashboardStats(filter?: DashboardFilter): Promise<DashboardStatsData> {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const whereClause: any = {};
        const whereInscripcion: any = {};
        const whereUser: any = {};

        if (filter?.startDate || filter?.endDate) {
            whereClause.createdAt = {
                ...(filter.startDate && { gte: new Date(filter.startDate) }),
                ...(filter.endDate && { lte: new Date(filter.endDate) })
            };
            whereInscripcion.fechaInscripcion = {
                ...(filter.startDate && { gte: new Date(filter.startDate) }),
                ...(filter.endDate && { lte: new Date(filter.endDate) })
            };
        }

        if (filter?.modalidad) {
            whereClause.modalidad = filter.modalidad;
        }

        if (filter?.entidadId) {
            whereClause.entidadesEncargadas = {
                some: { id: filter.entidadId }
            };
        }

        const [
            totalUsuarios,
            totalCapacitaciones,
            totalCertificados,
            usuariosPorRol,
            capacitacionesActivas,
            capacitacionesFinalizadas,
            certificadosEsteMes,
            usuariosRegistradosEsteMes,
            tendencias,
            totalHorasData,
            statsInscripciones,
            statsAsistencia,
            userGeneros,
            userProvincias,
            userEtnias,
            capacitacionesPorModalidadData
        ] = await Promise.all([
            this.prisma.usuario.count({ where: whereUser }),
            this.prisma.capacitacion.count({ where: whereClause }),
            this.prisma.certificado.count({ 
                where: { 
                    ...(filter?.startDate || filter?.endDate ? { fechaEmision: whereInscripcion.fechaInscripcion } : {}),
                    capacitacion: whereClause 
                } 
            }),
            this.getUsuariosPorRolData(whereUser),
            this.prisma.capacitacion.count({
                where: { ...whereClause, estado: EstadoCapacitacionEnum.PENDIENTE }
            }),
            this.prisma.capacitacion.count({
                where: { ...whereClause, estado: EstadoCapacitacionEnum.REALIZADA }
            }),
            this.prisma.certificado.count({
                where: { fechaEmision: { gte: firstDayOfMonth } }
            }),
            this.prisma.usuario.count({
                where: { createdAt: { gte: firstDayOfMonth } }
            }),
            this.getTendenciasData(),
            this.prisma.capacitacion.aggregate({ 
                _sum: { horas: true }, 
                where: { ...whereClause, estado: EstadoCapacitacionEnum.REALIZADA } 
            }),
            this.prisma.usuarioCapacitacion.count({ 
                where: { ...whereInscripcion, capacitacion: whereClause } 
            }),
            this.prisma.usuarioCapacitacion.count({ 
                where: { ...whereInscripcion, asistio: true, capacitacion: whereClause } 
            }),
            this.prisma.genero.findMany({ include: { _count: { select: { usuarios: { where: whereUser } } } } }),
            this.prisma.provincia.findMany({ 
                include: { _count: { select: { usuarios: { where: whereUser } } } }, 
                orderBy: { usuarios: { _count: 'desc' } }, take: 5 
            }),
            this.prisma.etnia.findMany({ include: { _count: { select: { usuarios: { where: whereUser } } } } }),
            this.prisma.capacitacion.groupBy({ 
                by: ['modalidad'], 
                where: whereClause,
                _count: { modalidad: true } 
            })
        ]);

        const participantesInscritos = statsInscripciones;
        const totalHorasCapacitacion = totalHorasData._sum.horas || 0;
        const tasaAsistencia = participantesInscritos > 0 ? (statsAsistencia / participantesInscritos) * 100 : 0;
        const tasaCertificacion = participantesInscritos > 0 ? (totalCertificados / participantesInscritos) * 100 : 0;

        const usuariosPorGenero = userGeneros.map(g => ({ nombre: g.nombre, cantidad: g._count.usuarios }));
        const usuariosPorEtnia = userEtnias.map(e => ({ nombre: e.nombre, cantidad: e._count.usuarios }));
        const topProvincias = userProvincias.map(p => ({ nombre: p.nombre, cantidad: p._count.usuarios }));
        
        const capacitacionesPorModalidad = capacitacionesPorModalidadData.map(m => ({ 
            nombre: m.modalidad || 'No definida', 
            cantidad: m._count.modalidad 
        }));
 
        return {
            totalUsuarios,
            totalCapacitaciones,
            totalCertificados,
            usuariosPorRol,
            capacitacionesActivas,
            capacitacionesFinalizadas,
            certificadosEsteMes,
            usuariosRegistradosEsteMes,
            tendencias,
            tasaAsistencia,
            totalHorasCapacitacion,
            participantesInscritos,
            tasaCertificacion,
            usuariosPorGenero,
            usuariosPorEtnia,
            topProvincias,
            capacitacionesPorModalidad
        };
    }

    private async getTendenciasData(): Promise<DashboardStatsTrend[]> {
        const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        // Optimizamos obteniendo rangos de fechas de antemano
        const queries = [];
        for (let i = 11; i >= 0; i--) {
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

    private async getUsuariosPorRolData(whereUser: any = {}) {
        const roles = await this.prisma.rol.findMany({
            include: {
                _count: {
                    select: { usuarios: { where: whereUser } }
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
