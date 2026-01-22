import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/users`; // Assuming standard endpoint

    constructor() { }

    getUsuarios(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getUsuario(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    createUsuario(usuario: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, usuario);
    }

    updateUsuario(id: number, usuario: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, usuario);
    }

    deleteUsuario(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    getUsuarioByAuthId(authId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/auth/${authId}`);
    }

    countUsuarios(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/count`);
    }
}
