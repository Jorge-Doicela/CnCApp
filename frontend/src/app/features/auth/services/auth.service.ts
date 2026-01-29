import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
    id: number;
    nombre: string;
    ci: string;
    email?: string;
    telefono?: string;
    rol: {
        id: number;
        nombre: string;
        modulos?: any;
    } | null;
    entidad: {
        id: number;
        nombre: string;
    } | null;
}

export interface LoginResponse {
    success: boolean;
    data: {
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
    };
    message?: string;
}

export interface RefreshResponse {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
    };
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    // Signals for auth state
    currentUser = signal<AuthUser | null>(null);
    isAuthenticated = signal<boolean>(false);
    accessToken = signal<string | null>(null);
    refreshToken = signal<string | null>(null);

    // Computed signals for easy consumption
    userName = computed(() => this.currentUser()?.nombre || null);
    userRole = computed(() => this.currentUser()?.rol?.id || null);
    roleName = computed(() => this.currentUser()?.rol?.nombre || null);
    modulos = computed(() => {
        const user = this.currentUser();
        if (!user || !user.rol || !user.rol.modulos) return [];

        let mods = user.rol.modulos;

        // Handle if it's already an array
        if (Array.isArray(mods)) return mods;

        // Handle stringified JSON
        if (typeof mods === 'string') {
            try {
                const parsed = JSON.parse(mods);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('[AUTH_SERVICE] Error parsing modules string:', e);
                return [];
            }
        }

        return [];
    });

    constructor(private http: HttpClient) {
        this.loadAuthState();
    }

    private loadAuthState() {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');

        if (storedAccessToken && storedRefreshToken && storedUser) {
            this.accessToken.set(storedAccessToken);
            this.refreshToken.set(storedRefreshToken);
            this.currentUser.set(JSON.parse(storedUser));
            this.isAuthenticated.set(true);
        }
    }

    login(ci: string, password: string): Observable<LoginResponse> {
        console.log('[AUTH_SERVICE] Login attempt:', { ci, passwordLength: password.length });

        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { ci, password }).pipe(
            tap({
                next: (response) => {
                    console.log('[AUTH_SERVICE] Login successful:', response);
                    if (response.success && response.data) {
                        this.setAuthData(
                            response.data.user,
                            response.data.accessToken,
                            response.data.refreshToken
                        );
                    }
                },
                error: (error) => {
                    console.error('[AUTH_SERVICE] Login failed:', error);
                }
            })
        );
    }

    refresh(): Observable<RefreshResponse> {
        const currentRefreshToken = this.refreshToken();
        if (!currentRefreshToken) {
            this.clearAuthData();
            throw new Error('No valid refresh token found');
        }

        return this.http.post<RefreshResponse>(`${this.apiUrl}/auth/refresh`, {
            refreshToken: currentRefreshToken
        }).pipe(
            tap({
                next: (response) => {
                    if (response.success && response.data) {
                        this.accessToken.set(response.data.accessToken);
                        this.refreshToken.set(response.data.refreshToken);
                        localStorage.setItem('accessToken', response.data.accessToken);
                        localStorage.setItem('refreshToken', response.data.refreshToken);
                        localStorage.setItem('token', response.data.accessToken); // Sync legacy
                    }
                },
                error: (err) => {
                    console.error('[AUTH_SERVICE] Refresh failed:', err);
                    this.clearAuthData();
                }
            })
        );
    }

    logout(): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
            tap(() => {
                this.clearAuthData();
            })
        );
    }

    setAuthData(user: AuthUser, accessToken: string, refreshToken: string) {
        this.currentUser.set(user);
        this.accessToken.set(accessToken);
        this.refreshToken.set(refreshToken);
        this.isAuthenticated.set(true);

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        // Legacy compatibility
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user_role', user.rol?.id.toString() || '0');
        localStorage.setItem('auth_uid', user.id.toString());
    }

    clearAuthData() {
        this.currentUser.set(null);
        this.accessToken.set(null);
        this.refreshToken.set(null);
        this.isAuthenticated.set(false);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('auth_uid');
    }

    register(data: {
        ci: string;
        nombre: string;
        email: string;
        telefono?: string;
        password: string;
    }): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, data).pipe(
            tap({
                next: (response) => {
                    if (response.success && response.data) {
                        this.setAuthData(
                            response.data.user,
                            response.data.accessToken,
                            response.data.refreshToken
                        );
                    }
                }
            })
        );
    }

    getAccessToken(): string | null {
        return this.accessToken();
    }

    // Password reset methods (placeholder - implement backend endpoints)
    requestPasswordReset(email: string, redirectTo: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/reset-password-request`, { email, redirectTo });
    }

    updatePassword(password: string, token?: string): Observable<any> {
        // If token is provided, it's a recovery flow. If not, it's an authenticated profile update.
        if (token) {
            return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, password });
        }

        const authToken = this.accessToken();
        return this.http.post(`${this.apiUrl}/auth/update-password`, { password }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
    }
}
