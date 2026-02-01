import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Cargo {
    id: number;
    nombre: string;
}

@Injectable({
    providedIn: 'root'
})
export class CargService {
    private apiUrl = `${environment.apiUrl}/cargos`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Cargo[]> {
        return this.http.get<Cargo[]>(this.apiUrl);
    }

    create(nombre: string): Observable<Cargo> {
        return this.http.post<Cargo>(this.apiUrl, { nombre });
    }

    update(id: number, nombre: string): Observable<Cargo> {
        return this.http.put<Cargo>(`${this.apiUrl}/${id}`, { nombre });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
