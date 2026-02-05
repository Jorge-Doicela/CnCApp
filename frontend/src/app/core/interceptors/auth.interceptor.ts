import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * HTTP Interceptor para adjuntar el token JWT a todas las peticiones API
 * y manejar errores de autenticación
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    // Obtener el token de localStorage
    const token = localStorage.getItem('accessToken');

    // Lista de endpoints que no requieren autenticación
    const publicEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];

    // Verificar si la petición es a un endpoint público
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
        req.url.includes(endpoint)
    );

    // Si hay token y no es un endpoint público, adjuntar el header Authorization
    if (token && !isPublicEndpoint) {
        console.log('[AUTH_INTERCEPTOR] Adding token to request:', req.url);
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    } else {
        console.log('[AUTH_INTERCEPTOR] Requesting without token (Public or No Token):', req.url);
    }

    // Manejar la petición y capturar errores
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Si es error 401 (No autorizado), redirigir al login
            if (error.status === 401) {
                console.warn('[AUTH_INTERCEPTOR] Token inválido o expirado, redirigiendo al login');

                // Limpiar datos de autenticación
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('user_role');
                localStorage.removeItem('auth_uid');

                // Redirigir al login
                router.navigate(['/login']);
            }

            return throwError(() => error);
        })
    );
};
