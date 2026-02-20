export interface DashboardStatsTrend {
    mes: string;
    usuarios: number;
    certificados: number;
}

export interface DashboardStatsData {
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
    tendencias: DashboardStatsTrend[];
}

export interface ReportesRepository {
    getDashboardStats(): Promise<DashboardStatsData>;
}
