import { injectable, inject } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

interface DashboardStats {
    totalUsuarios: number;
    totalCapacitaciones: number;
    totalCertificados: number;
    usuariosPorRol: {
        administrador: number;
        conferencista: number;
        usuario: number;
    };
    capacitacionesActivas: number;
    capacitacionesFinalizadas: number;
    certificadosEsteMes: number;
    usuariosRegistradosEsteMes: number;
}

@injectable()
export class GetDashboardStatsUseCase {
    constructor(
        @inject('PrismaClient') private readonly prisma: PrismaClient
    ) { }

    async execute(): Promise<DashboardStats> {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Obtener totales
        const [
            totalUsuarios,
            totalCapacitaciones,
            totalCertificados,
            usuariosPorRol,
            capacitacionesActivas,
            capacitacionesFinalizadas,
            certificadosEsteMes,
            usuariosRegistradosEsteMes
        ] = await Promise.all([
            this.prisma.usuario.count(),
            this.prisma.capacitacion.count(),
            this.prisma.certificado.count(),
            this.getUsuariosPorRol(),
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
                    fechaRegistro: { gte: firstDayOfMonth }
                }
            })
        ]);

        return {
            totalUsuarios,
            totalCapacitaciones,
            totalCertificados,
            usuariosPorRol,
            capacitacionesActivas,
            capacitacionesFinalizadas,
            certificadosEsteMes,
            usuariosRegistradosEsteMes
        };
    }

    private async getUsuariosPorRol() {
        const usuarios = await this.prisma.usuario.groupBy({
            by: ['rolId'],
            _count: true
        });

        return {
            administrador: usuarios.find(u => u.rolId === 1)?._count || 0,
            conferencista: usuarios.find(u => u.rolId === 2)?._count || 0,
            usuario: usuarios.find(u => u.rolId === 3)?._count || 0
        };
    }
}
