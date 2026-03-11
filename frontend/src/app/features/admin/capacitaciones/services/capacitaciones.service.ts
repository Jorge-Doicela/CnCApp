import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Capacitacion, UsuarioCapacitacion } from '../../../../core/models/capacitacion.interface';
import { Certificado } from '../../../../core/models/certificado.interface';

export interface InscritoInfo {
    id: number;           // ID de la inscripción (junction table PK)
    usuarioId: number;    // ID del usuario
    nombre: string;
    rolCapacitacion: string;
    asistio: boolean;
    email?: string;
    entidad?: string;
}

export interface ConfirmarAsistenciaQRResult {
    message: string;
    capacitacion: {
        id: number;
        nombre: string;
        fechaInicio: string;
        lugar: string;
    };
    yaConfirmado: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CapacitacionesService {
    private apiUrl = `${environment.apiUrl}/capacitaciones`;
    private usuariosCapacitacionesUrl = `${environment.apiUrl}/usuarios-capacitaciones`;

    constructor(private http: HttpClient) { }

    // --- CRUD Capacitaciones ---

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

    countCapacitaciones(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.apiUrl}/count`);
    }

    checkNombreUniqueness(nombre: string, excludeId?: number): Observable<{ exists: boolean }> {
        let params = new HttpParams().set('nombre', nombre);
        if (excludeId) {
            params = params.set('excludeId', excludeId.toString());
        }
        return this.http.get<{ exists: boolean }>(`${this.apiUrl}/validar-nombre`, { params });
    }

    // --- Gestión de Inscritos ---

    /** Obtiene la lista de inscritos de una capacitación (solo staff) */
    getInscritos(idCapacitacion: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.usuariosCapacitacionesUrl}/${idCapacitacion}`);
    }

    /** Inscribir a un usuario en una capacitación */
    inscribirse(idUsuario: number, idCapacitacion: number): Observable<UsuarioCapacitacion> {
        return this.http.post<UsuarioCapacitacion>(this.usuariosCapacitacionesUrl, {
            capacitacionId: idCapacitacion,
            usuarioId: idUsuario,
            rolCapacitacion: 'Participante',
            asistio: false
        });
    }

    /** Agregar usuario a una capacitación con un rol específico (staff) */
    assignUser(capacitacionId: number, userId: number, role: string): Observable<UsuarioCapacitacion> {
        return this.http.post<UsuarioCapacitacion>(this.usuariosCapacitacionesUrl, {
            capacitacionId,
            usuarioId: userId,
            rolCapacitacion: role,
            asistio: false
        });
    }

    /** Cancelar inscripción de un usuario */
    cancelarInscripcion(idUsuario: number, idCapacitacion: number): Observable<any> {
        return this.http.delete<any>(`${this.usuariosCapacitacionesUrl}/${idCapacitacion}/${idUsuario}`);
    }

    /** Eliminar inscripción por ID de relación (junction PK) */
    deleteUsuarioCapacitacion(idRelacion: number): Observable<any> {
        return this.http.delete<any>(`${this.usuariosCapacitacionesUrl}/relacion/${idRelacion}`);
    }

    // --- Asistencia ---

    /** Actualizar asistencia individual por ID de inscripción */
    updateAttendance(idInscripcion: number, asistencia: boolean): Observable<any> {
        return this.http.put<any>(`${this.usuariosCapacitacionesUrl}/asistencia/${idInscripcion}`, { asistencia });
    }

    /** Marcar asistencia de todos los participantes de una capacitación */
    updateAllAttendance(idCapacitacion: number, asistencia: boolean): Observable<any> {
        return this.http.put<any>(`${this.usuariosCapacitacionesUrl}/asistencia-masiva/${idCapacitacion}`, { asistencia });
    }

    /**
     * Confirmar asistencia mediante QR del evento.
     * El usuario escanea el QR y este endpoint registra su asistencia automáticamente.
     * @param codigoQrEvento El UUID codificado en el QR del evento
     */
    confirmarAsistenciaQR(codigoQrEvento: string): Observable<ConfirmarAsistenciaQRResult> {
        return this.http.post<ConfirmarAsistenciaQRResult>(
            `${this.usuariosCapacitacionesUrl}/confirmar-asistencia-qr`,
            { codigoQrEvento }
        );
    }

    // --- Inscripciones del usuario ---

    /** Historial de inscripciones de un usuario */
    getInscripcionesUsuario(idUsuario: number): Observable<UsuarioCapacitacion[]> {
        return this.http.get<UsuarioCapacitacion[]>(`${this.usuariosCapacitacionesUrl}/usuario/${idUsuario}`);
    }

    // --- Certificados ---

    countCertificados(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${environment.apiUrl}/certificados/count`);
    }

    generateAllCertificates(capacitacionId: number): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/certificados/generate-all`, {
            capacitacionId
        });
    }
}
