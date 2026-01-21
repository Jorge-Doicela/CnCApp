import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CapacitacionesService {
    private apiUrl = `${environment.apiUrl}/capacitaciones`;
    private usuariosCapacitacionesUrl = `${environment.apiUrl}/usuarios-capacitaciones`;

    constructor(private http: HttpClient) { }

    getCapacitaciones(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getCapacitacion(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    createCapacitacion(data: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, data);
    }

    updateCapacitacion(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, data);
    }

    deleteCapacitacion(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    // Métodos específicos para Usuarios_Capacitaciones logic

    getUsuariosNoAsistieron(idCapacitacion: number): Observable<any[]> {
        // Assuming backend endpoint support filtering via query params
        return this.http.get<any[]>(`${this.usuariosCapacitacionesUrl}?idCapacitacion=${idCapacitacion}&asistencia=false`);
    }

    deleteUsuariosNoAsistieron(idCapacitacion: number): Observable<any> {
        return this.http.delete<any>(`${this.usuariosCapacitacionesUrl}/no-asistieron/${idCapacitacion}`);
    }

    assignUser(capacitacionId: number, userId: number, role: string): Observable<any> {
        return this.http.post<any>(this.usuariosCapacitacionesUrl, {
            Id_Capacitacion: capacitacionId,
            Id_Usuario: userId,
            Rol_Capacitacion: role,
            Fecha_Asignacion: new Date().toISOString(),
            Asistencia: false
        });
    }

    // Obtener usuarios inscritos
    getInscritos(idCapacitacion: number): Observable<any[]> {
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
    getInscripcionesUsuario(idUsuario: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.usuariosCapacitacionesUrl}/usuario/${idUsuario}`);
    }

    inscribirse(idUsuario: number, idCapacitacion: number): Observable<any> {
        return this.http.post<any>(this.usuariosCapacitacionesUrl, {
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

    countCapacitaciones(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/count`);
    }

    countCertificados(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/count/certificados`);
    }
}
