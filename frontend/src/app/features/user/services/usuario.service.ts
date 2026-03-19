import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { Usuario } from '../../../core/models/usuario.interface';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/users`;

    constructor() { }

    private cleanUsuario(u: Usuario): Usuario {
        if (u && u.nombre) {
            u.nombre = u.nombre.replace(/\s*null\s*/g, ' ').trim();
        }
        return u;
    }

    getUsuarios(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(this.apiUrl).pipe(
            map(users => users.map(u => this.cleanUsuario(u)))
        );
    }

    getUsuario(id: number): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.apiUrl}/${id}`).pipe(
            map(u => this.cleanUsuario(u))
        );
    }

    createUsuario(usuario: Partial<Usuario>): Observable<Usuario> {
        return this.http.post<Usuario>(this.apiUrl, usuario).pipe(
            map(u => this.cleanUsuario(u))
        );
    }

    updateUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
        return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario).pipe(
            map(u => this.cleanUsuario(u))
        );
    }

    deleteUsuario(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getUsuarioByAuthId(authId: string): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.apiUrl}/auth/${authId}`).pipe(
            map(u => this.cleanUsuario(u))
        );
    }

    countUsuarios(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.apiUrl}/count`);
    }
}
