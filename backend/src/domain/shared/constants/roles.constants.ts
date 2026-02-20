/**
 * Constantes para los IDs de roles en el sistema.
 * Nota: En un sistema ideal, estos deberían consultarse por nombre,
 * pero centralizarlos aquí previene errores de hardcoding dispersos.
 */
export const ROLES = {
    ADMINISTRADOR: 4, // Según base de datos actual (antes era 1)
    CONFERENCISTA: 5,
    USUARIO: 6
};

// IDs permitidos para administradores (por si cambia en el futuro)
export const ADMIN_ROLES = [1, 4]; 
