import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface AuthUser {
    id: number;
    nombre: string;
    ci: string;
    email?: string;
    rolId: number;
    rol: {
        id: number;
        nombre: string;
        modulos?: string[];
    };
}

export interface AuthResponse {
    message: string;
    user: AuthUser;
    token: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    // Signals for auth state
    currentUser = signal<AuthUser | null>(null);
    isAuthenticated = signal<boolean>(false);
    token = signal<string | null>(null);

    constructor(private http: HttpClient) {
        this.loadAuthState();
    }

    private loadAuthState() {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            this.token.set(storedToken);
            this.isAuthenticated.set(true);
        }
    }

    login(ci: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { ci, password });
    }

    register(data: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data);
    }

    getProfile(token: string): Observable<AuthUser> {
        return this.http.get<AuthUser>(`${this.apiUrl}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    setAuthData(user: AuthUser, token: string) {
        this.currentUser.set(user);
        this.token.set(token);
        this.isAuthenticated.set(true);
        localStorage.setItem('token', token);
        localStorage.setItem('user_role', user.rolId.toString());
        localStorage.setItem('auth_uid', user.id.toString());
    }

    clearAuthData() {
        this.currentUser.set(null);
        this.token.set(null);
        this.isAuthenticated.set(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('auth_uid');
    }

    requestPasswordReset(email: string, redirectTo: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/reset-password-request`, { email, redirectTo });
    }

    updatePassword(password: string): Observable<any> {
        const token = this.token();
        return this.http.post(`${this.apiUrl}/auth/update-password`, { password }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}

