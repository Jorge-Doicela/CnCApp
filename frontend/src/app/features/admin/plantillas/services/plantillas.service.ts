import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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
    };
    activa: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PlantillasService {

    // Mock data for now
    private plantillas: PlantillaCertificado[] = [
        {
            id: 1,
            nombre: 'Plantilla Estándar CNC 2024',
            imagenUrl: 'assets/certificados/plantilla.png',
            configuracion: {
                nombreUsuario: { x: 420, y: 300, fontSize: 28, color: '#000000' },
                curso: { x: 420, y: 370, fontSize: 14, color: '#000000' },
                fecha: { x: 420, y: 450, fontSize: 12, color: '#000000' }
            },
            activa: true
        }
    ];

    constructor() { }

    getPlantillas(): Observable<PlantillaCertificado[]> {
        return of(this.plantillas);
    }

    getPlantilla(id: number): Observable<PlantillaCertificado | undefined> {
        const plantilla = this.plantillas.find(p => p.id === id);
        return of(plantilla);
    }

    savePlantilla(plantilla: PlantillaCertificado): Observable<PlantillaCertificado> {
        if (plantilla.id) {
            const index = this.plantillas.findIndex(p => p.id === plantilla.id);
            if (index !== -1) {
                this.plantillas[index] = plantilla;
            }
        } else {
            plantilla.id = this.plantillas.length + 1;
            this.plantillas.push(plantilla);
        }
        return of(plantilla);
    }

    deletePlantilla(id: number): Observable<boolean> {
        this.plantillas = this.plantillas.filter(p => p.id !== id);
        return of(true);
    }
}
