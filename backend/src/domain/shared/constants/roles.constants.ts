/**
 * Constantes para los nombres de roles en el sistema.
 * Basarse en nombres es más robusto que en IDs numéricos que pueden cambiar.
 */
export const ROLES = {
    ADMINISTRADOR: 'Administrador',
    CONFERENCISTA: 'Conferencista',
    USUARIO: 'Usuario'
};

// Roles permitidos para administradores
export const ADMIN_ROLES = [ROLES.ADMINISTRADOR]; 
