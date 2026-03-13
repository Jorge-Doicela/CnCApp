import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface DashboardFilter {
    startDate?: string;
    endDate?: string;
    entidadId?: number;
    modalidad?: string;
}

export interface DashboardStats {
// ... existing interface ...
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
    tendencias: Array<{
        mes: string;
        usuarios: number;
        certificados: number;
    }>;
    // Nuevas métricas avanzadas
    tasaAsistencia: number;
    totalHorasCapacitacion: number;
    participantesInscritos: number;
    tasaCertificacion: number;
    usuariosPorGenero: Array<{ nombre: string; cantidad: number; }>;
    usuariosPorEtnia: Array<{ nombre: string; cantidad: number; }>;
    topProvincias: Array<{ nombre: string; cantidad: number; }>;
    capacitacionesPorModalidad: Array<{ nombre: string; cantidad: number; }>;
}

@Injectable({
    providedIn: 'root'
})
export class ReportesService {
    private apiUrl = `${environment.apiUrl}/reportes`;

    constructor(private http: HttpClient) { }

    getDashboardStats(filter?: DashboardFilter): Observable<{ success: boolean; data: DashboardStats }> {
        let params = new HttpParams();
        if (filter) {
            if (filter.startDate) params = params.set('startDate', filter.startDate);
            if (filter.endDate) params = params.set('endDate', filter.endDate);
            if (filter.entidadId) params = params.set('entidadId', filter.entidadId.toString());
            if (filter.modalidad) params = params.set('modalidad', filter.modalidad);
        }
        return this.http.get<{ success: boolean; data: DashboardStats }>(`${this.apiUrl}/dashboard`, { params });
    }

    exportDashboardPDF(filter?: DashboardFilter): Observable<Blob> {
        let params = new HttpParams();
        if (filter) {
            if (filter.startDate) params = params.set('startDate', filter.startDate);
            if (filter.endDate) params = params.set('endDate', filter.endDate);
            if (filter.entidadId) params = params.set('entidadId', filter.entidadId.toString());
            if (filter.modalidad) params = params.set('modalidad', filter.modalidad);
        }
        return this.http.get(`${this.apiUrl}/export-pdf`, { params, responseType: 'blob' });
    }
}
