import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CertificadosService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/certificados`;
    private qrUrl = `${environment.apiUrl}/certificados/qr`; // Use specific if needed, but relative to apiUrl is fine

    constructor() { }

    verifyCertificateByHash(hash: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/qr/${hash}`);
    }

    verifyHash(idUsuario: string, idCapacitacion: number): Observable<any[]> {
        // Should return array matching Supabase structure for compatibility initially
        // Or null if not found
        return this.http.get<any[]>(`${this.apiUrl}/verify`, { params: { idUsuario, idCapacitacion: idCapacitacion.toString() } });
    }

    saveCertificate(certificateData: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, certificateData);
    }

    // Helper to fetch data needed for certificate generation
    getCertificateData(idCapacitacion: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/data/${idCapacitacion}`);
    }

    // Method to replace: supabase.from('Usuarios_Capacitaciones').select('Rol_Capacitacion').match({...})
    getUserRoleInConference(idCapacitacion: number, idUsuario: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/user-role`, { params: { idCapacitacion: idCapacitacion.toString(), idUsuario } });
    }
}
