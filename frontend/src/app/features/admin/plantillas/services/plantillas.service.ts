import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface PlantillaCertificado {
    id: number;
    nombre: string;
    imagenUrl: string;
    configuracion: {
        nombreUsuario: { x: number, y: number, fontSize: number, color: string };
        curso: { x: number, y: number, fontSize: number, color: string };
        fecha: { x: number, y: number, fontSize: number, color: string };
        cedula?: { x: number, y: number, fontSize: number, color: string };
        rol?: { x: number, y: number, fontSize: number, color: string };
        horas?: { x: number, y: number, fontSize: number, color: string };
    };
    activa: boolean;
    createdAt?: string;
    updatedAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PlantillasService {
    private apiUrl = `${environment.apiUrl}/plantillas`;
    private http = inject(HttpClient);

    constructor() { }

    getPlantillas(): Observable<PlantillaCertificado[]> {
        return this.http.get<PlantillaCertificado[]>(this.apiUrl);
    }

    getPlantilla(id: number): Observable<PlantillaCertificado> {
        return this.http.get<PlantillaCertificado>(`${this.apiUrl}/${id}`);
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
