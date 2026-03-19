import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PlantillaCertificado } from '../../../../core/models/plantilla.interface';

@Injectable({
    providedIn: 'root'
})
export class PlantillasService {
    private apiUrl = `${environment.apiUrl}/plantillas`;
    private http = inject(HttpClient);

    constructor() { }

    getPlantillas(): Observable<PlantillaCertificado[]> {
        return this.http.get<PlantillaCertificado[]>(this.apiUrl).pipe(
            map(plantillas => plantillas.map(p => this.sanitizarPlantilla(p)))
        );
    }

    getPlantilla(id: number): Observable<PlantillaCertificado> {
        return this.http.get<PlantillaCertificado>(`${this.apiUrl}/${id}`).pipe(
            map(p => this.sanitizarPlantilla(p))
        );
    }

    private sanitizarPlantilla(p: PlantillaCertificado): PlantillaCertificado {
        // 1. Fallback si no hay imagen
        if (!p.imagenUrl) {
            p.imagenUrl = '/assets/certificados/plantilla.png';
        }

        // 2. Si la configuración viene vacía, aplicar un default
        if (!p.configuracion || Object.keys(p.configuracion).length === 0) {
            p.configuracion = {
                nombreUsuario: { x: 420, y: 300, fontSize: 32, color: '#1a1a1a' },
                curso: { x: 420, y: 370, fontSize: 18, color: '#333333' },
                fecha: { x: 420, y: 450, fontSize: 14, color: '#666666' }
            };
        }

        // 3. Extract firmas from configuracion JSON slot for transient use
        if (p.configuracion && (p.configuracion as any).firmas) {
            p.firmas = (p.configuracion as any).firmas;
        }

        if (!p.firmas) {
            p.firmas = [];
        }

        return p;
    }

    private prepareForSave(p: Partial<PlantillaCertificado>): any {
        const clone = JSON.parse(JSON.stringify(p));
        // Move signatures into the JSON bucket for persistence
        if (clone.firmas) {
            if (!clone.configuracion) clone.configuracion = {};
            clone.configuracion.firmas = clone.firmas;
            delete clone.firmas; // Transient field, not in DB schema directly
        }
        return clone;
    }

    createPlantilla(plantilla: Partial<PlantillaCertificado>): Observable<PlantillaCertificado> {
        const data = this.prepareForSave(plantilla);
        return this.http.post<PlantillaCertificado>(this.apiUrl, data).pipe(
            map(p => this.sanitizarPlantilla(p))
        );
    }

    updatePlantilla(id: number, plantilla: Partial<PlantillaCertificado>): Observable<PlantillaCertificado> {
        const data = this.prepareForSave(plantilla);
        return this.http.put<PlantillaCertificado>(`${this.apiUrl}/${id}`, data).pipe(
            map(p => this.sanitizarPlantilla(p))
        );
    }

    savePlantilla(plantilla: PlantillaCertificado): Observable<PlantillaCertificado> {
        if (plantilla.id && plantilla.id > 0) {
            return this.updatePlantilla(plantilla.id, plantilla);
        } else {
            return this.createPlantilla(plantilla);
        }
    }

    deletePlantilla(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    activarPlantilla(id: number): Observable<PlantillaCertificado> {
        return this.http.patch<PlantillaCertificado>(`${this.apiUrl}/${id}/activar`, {}).pipe(
            map(p => this.sanitizarPlantilla(p))
        );
    }
}
