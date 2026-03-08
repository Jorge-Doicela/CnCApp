import { HttpErrorResponse } from '@angular/common/http';

export class ErrorHandlerUtil {
    /**
     * Extrae un mensaje de error amigable de una respuesta HttpErrorResponse
     */
    static getErrorMessage(error: any): string {
        if (typeof error === 'string') return error;

        if (error instanceof HttpErrorResponse) {
            // Error de validación del backend (Zod) o Prisma traducido
            if (error.error && error.error.message) {
                return error.error.message;
            }

            // Fallback para códigos HTTP comunes
            switch (error.status) {
                case 400: return 'Petición incorrecta. Verifique los datos enviados.';
                case 401: return 'No autorizado. Por favor, inicie sesión nuevamente.';
                case 403: return 'Acceso prohibido. No tiene permisos para esta acción.';
                case 404: return 'El recurso solicitado no existe.';
                case 409: return 'Conflicto: El registro ya existe.';
                case 500: return 'Error interno del servidor. Intente más tarde.';
                default: return 'Ocurrió un error inesperado en la comunicación.';
            }
        }

        return error?.message || 'Error desconocido';
    }
}
