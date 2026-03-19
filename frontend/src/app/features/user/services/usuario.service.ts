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
        if (!u) return u;
        
        const clean = (val: any) => {
            if (val === null || val === undefined) return '';
            return val.toString().replace(/\bnull\b/g, '').trim();
        };

        if (u.nombre) u.nombre = u.nombre.replace(/\s*null\s*/g, ' ').trim();
        u.primerNombre = clean(u.primerNombre);
        u.segundoNombre = clean(u.segundoNombre);
        u.primerApellido = clean(u.primerApellido);
        u.segundoApellido = clean(u.segundoApellido);
        
        return u;
    }

    getFullName(u: Usuario | null | undefined): string {
        if (!u) return '';
        
        const parts = [
            u.primerNombre,
            u.segundoNombre,
            u.primerApellido,
            u.segundoApellido
        ].map(p => (p || '').toString().replace(/\bnull\b/g, '').trim())
         .filter(p => !!p);

        if (parts.length > 0) return parts.join(' ');
        
        return (u.nombre || '').replace(/\s*null\s*/g, ' ').trim();
    }

    getInicial(u: Usuario | null | undefined): string {
        const full = this.getFullName(u);
        if (!full || full.trim() === '') return 'U';
        return full.charAt(0).toUpperCase();
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
