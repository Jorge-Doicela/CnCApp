import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
        // 1. Fallback si no hay imagen (el backend ya resuelve las relativas a absolutas)
        if (!p.imagenUrl) {
            p.imagenUrl = '/assets/certificados/plantilla.png';
        }

        // 2. Si la configuración viene vacía, aplicar un default (aunque el backend ya lo hace, esto protege de datos corruptos)
        if (!p.configuracion || Object.keys(p.configuracion).length === 0) {
            p.configuracion = {
                nombreUsuario: { x: 420, y: 300, fontSize: 32, color: '#1a1a1a' },
                curso: { x: 420, y: 370, fontSize: 18, color: '#333333' },
                fecha: { x: 420, y: 450, fontSize: 14, color: '#666666' }
            };
        }

        return p;
    }

    createPlantilla(plantilla: Partial<PlantillaCertificado>): Observable<PlantillaCertificado> {
        return this.http.post<PlantillaCertificado>(this.apiUrl, plantilla);
    }

    updatePlantilla(id: number, plantilla: Partial<PlantillaCertificado>): Observable<PlantillaCertificado> {
        return this.http.put<PlantillaCertificado>(`${this.apiUrl}/${id}`, plantilla);
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
        return this.http.patch<PlantillaCertificado>(`${this.apiUrl}/${id}/activar`, {});
    }

    uploadImage(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('image', file);
        return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData);
    }
}
