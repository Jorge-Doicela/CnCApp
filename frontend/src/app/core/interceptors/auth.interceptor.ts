import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, BehaviorSubject, switchMap, filter, take } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * HTTP Interceptor para adjuntar el token JWT a todas las peticiones API
 * y manejar silenciosamente la caducidad (Refresh Tokens) sin desloguear al usuario
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    // Obtener el token de localStorage
    const token = localStorage.getItem('accessToken');

    // Lista de endpoints que no requieren autenticación
    const publicEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];

    // Verificar si la petición es a un endpoint público
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
        req.url.includes(endpoint)
    );

    let authReq = req;
    // Si hay token y no es un endpoint público, adjuntar el header Authorization
    if (token && !isPublicEndpoint) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // Manejar la petición y capturar errores
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Si es error 401 (No autorizado) en ruta protegida, INTENTAR REFRESCAR
            if (error.status === 401 && !isPublicEndpoint) {
                
                // Si NO estamos refrescando ya otro hilo, iniciamos el refresh
                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshTokenSubject.next(null); // Bloquear cola

                    return authService.refresh().pipe(
                        switchMap((response) => {
                            isRefreshing = false;
                            
                            // Guardar nuevos tokens en localStorage y en el subject para liberar cola
                            localStorage.setItem('accessToken', response.data.accessToken);
                            localStorage.setItem('refreshToken', response.data.refreshToken);
                            refreshTokenSubject.next(response.data.accessToken);
                            
                            // Reintentar la petición original con el nuevo token
                            return next(req.clone({
                                setHeaders: { Authorization: `Bearer ${response.data.accessToken}` }
                            }));
                        }),
                        catchError((refreshError) => {
                            // SI el refresh falla (ej: Token refresh espirado de 7 dias), BOTAR al login
                            isRefreshing = false;
                            console.warn('[AUTH_INTERCEPTOR] Refresh fallido. Sesión expirada por completo.');
                            
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            localStorage.removeItem('user');
                            
                            router.navigate(['/login']);
                            return throwError(() => refreshError);
                        })
                    );
                } else {
                    // Si YA se está refrescando, pausar esta petición usando el BehaviorSubject
                    return refreshTokenSubject.pipe(
                        filter(token => token !== null),
                        take(1),
                        switchMap((newToken) => {
                            // Reanudar la petición cuando el Token esté listo
                            return next(req.clone({
                                setHeaders: { Authorization: `Bearer ${newToken}` }
                            }));
                        })
                    );
                }
            }

            // Fallback para otros errores o un 401 del propio endpoint de refresh/login
            return throwError(() => error);
        })
    );
};
