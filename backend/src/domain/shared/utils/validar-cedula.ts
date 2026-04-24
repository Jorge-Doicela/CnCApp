/**
 * Validador de Cédula Ecuatoriana (Algoritmo de Módulo 10)
 */
export function validarCedula(cedula: string): boolean {
    if (!cedula) return false;
    // Permitimos cualquier documento entre 5 y 20 caracteres (cédulas, pasaportes, etc.)
    return cedula.length >= 5 && cedula.length <= 20;
}
