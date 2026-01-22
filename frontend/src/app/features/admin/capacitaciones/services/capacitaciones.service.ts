import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Capacitacion, UsuarioCapacitacion } from '../../../../core/models/capacitacion.interface';
import { Certificado } from '../../../../core/models/certificado.interface';

@Injectable({
    providedIn: 'root'
})
export class CapacitacionesService {
    private apiUrl = `${environment.apiUrl}/capacitaciones`;
    private usuariosCapacitacionesUrl = `${environment.apiUrl}/usuarios-capacitaciones`;

    constructor(private http: HttpClient) { }

    getCapacitaciones(): Observable<Capacitacion[]> {
        return this.http.get<Capacitacion[]>(this.apiUrl);
    }

    getCapacitacion(id: number): Observable<Capacitacion> {
        return this.http.get<Capacitacion>(`${this.apiUrl}/${id}`);
    }

    createCapacitacion(data: Partial<Capacitacion>): Observable<Capacitacion> {
        return this.http.post<Capacitacion>(this.apiUrl, data);
    }

    updateCapacitacion(id: number, data: Partial<Capacitacion>): Observable<Capacitacion> {
        return this.http.put<Capacitacion>(`${this.apiUrl}/${id}`, data);
    }

    deleteCapacitacion(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Métodos específicos para Usuarios_Capacitaciones logic

    getUsuariosNoAsistieron(idCapacitacion: number): Observable<UsuarioCapacitacion[]> {
        // Assuming backend endpoint support filtering via query params
        return this.http.get<UsuarioCapacitacion[]>(`${this.usuariosCapacitacionesUrl}?idCapacitacion=${idCapacitacion}&asistencia=false`);
    }

    deleteUsuariosNoAsistieron(idCapacitacion: number): Observable<any> {
        return this.http.delete<any>(`${this.usuariosCapacitacionesUrl}/no-asistieron/${idCapacitacion}`);
    }

    assignUser(capacitacionId: number, userId: number, role: string): Observable<UsuarioCapacitacion> {
        return this.http.post<UsuarioCapacitacion>(this.usuariosCapacitacionesUrl, {
            Id_Capacitacion: capacitacionId,
            Id_Usuario: userId,
            Rol_Capacitacion: role,
            Fecha_Asignacion: new Date().toISOString(),
            Asistencia: false
        });
    }

    // Obtener usuarios inscritos
    getInscritos(idCapacitacion: number): Observable<any[]> {
        // Returns mixed User + Junction data, keeping any[] for now until joined interface is defined
        return this.http.get<any[]>(`${this.usuariosCapacitacionesUrl}/${idCapacitacion}`);
    }

    // Actualizar asistencia individual
    updateAttendance(idUsuarioConferencia: number, asistencia: boolean): Observable<any> {
        return this.http.put<any>(`${this.usuariosCapacitacionesUrl}/asistencia/${idUsuarioConferencia}`, { asistencia });
    }

    // Actualizar asistencia masiva (todos los participantes)
    updateAllAttendance(idCapacitacion: number, asistencia: boolean): Observable<any> {
        return this.http.put<any>(`${this.usuariosCapacitacionesUrl}/asistencia-masiva/${idCapacitacion}`, { asistencia });
    }

    // Eliminar asignación por ID de relación (Id_Usuario_Conferencia)
    deleteUsuarioCapacitacion(idUsuarioConferencia: number): Observable<any> {
        return this.http.delete<any>(`${this.usuariosCapacitacionesUrl}/relacion/${idUsuarioConferencia}`);
    }

    // Método para eliminar asignación (opcional si se requiere)
    removeUserAssignment(capacitacionId: number, userId: number): Observable<any> {
        // Assuming endpoint supports query params or specific path
        return this.http.delete<any>(`${this.usuariosCapacitacionesUrl}/${capacitacionId}/${userId}`);
    }

    // New methods for Home Page
    getInscripcionesUsuario(idUsuario: number): Observable<UsuarioCapacitacion[]> {
        return this.http.get<UsuarioCapacitacion[]>(`${this.usuariosCapacitacionesUrl}/usuario/${idUsuario}`);
    }

    inscribirse(idUsuario: number, idCapacitacion: number): Observable<UsuarioCapacitacion> {
        return this.http.post<UsuarioCapacitacion>(this.usuariosCapacitacionesUrl, {
            Id_Capacitacion: idCapacitacion,
            Id_Usuario: idUsuario,
            Rol_Capacitacion: 'Participante',
            Asistencia: false
        });
    }

    cancelarInscripcion(idUsuario: number, idCapacitacion: number): Observable<any> {
        // Dedicated endpoint or use generic delete
        return this.http.delete<any>(`${this.usuariosCapacitacionesUrl}/${idCapacitacion}/${idUsuario}`);
    }

    countCapacitaciones(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.apiUrl}/count`);
    }

    countCertificados(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.apiUrl}/count/certificados`);
    }
}

