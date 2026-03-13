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
    // Nuevas estadísticas avanzadas
    tasaAsistencia: number;
    totalHorasCapacitacion: number;
    participantesInscritos: number;
    tasaCertificacion: number;
    usuariosPorGenero: Array<{ nombre: string; cantidad: number; }>;
    usuariosPorEtnia: Array<{ nombre: string; cantidad: number; }>;
    topProvincias: Array<{ nombre: string; cantidad: number; }>;
    capacitacionesPorModalidad: Array<{ nombre: string; cantidad: number; }>;
}

export interface DashboardFilter {
    startDate?: string;
    endDate?: string;
    entidadId?: number;
    modalidad?: string;
}

export interface ReportesRepository {
    getDashboardStats(filter?: DashboardFilter): Promise<DashboardStatsData>;
}
