import { injectable, inject } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

interface DashboardStats {
    totalUsuarios: number;
    totalCapacitaciones: number;
    totalCertificados: number;
    usuariosPorRol: Array<{
        nombre: string;
        cantidad: number;
    }>;
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
                    createdAt: { gte: firstDayOfMonth }
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
