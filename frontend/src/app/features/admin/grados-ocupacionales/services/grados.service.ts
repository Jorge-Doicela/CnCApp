import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface GradoOcupacional {
    id: number;
    nombre: string;
}

@Injectable({
    providedIn: 'root'
})
export class GradosOcupacionalesService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/grados-ocupacionales`;

    getAll(): Observable<GradoOcupacional[]> {
        return this.http.get<GradoOcupacional[]>(this.apiUrl);
    }

    getById(id: number): Observable<GradoOcupacional> {
        return this.http.get<GradoOcupacional>(`${this.apiUrl}/${id}`);
    }

    create(nombre: string): Observable<GradoOcupacional> {
        return this.http.post<GradoOcupacional>(this.apiUrl, { nombre });
    }

    update(id: number, nombre: string): Observable<GradoOcupacional> {
        return this.http.put<GradoOcupacional>(`${this.apiUrl}/${id}`, { nombre });
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
