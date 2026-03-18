import { validarCedula } from './validar-cedula';

/**
 * Valida un documento de identidad.
 * Si tiene exactamente 10 dígitos numéricos, lo valida estrictamente como Cédula Ecuatoriana (Módulo 10).
 * Si tiene letras o diferente longitud (pero mayor a 4 caracteres), lo acepta como Pasaporte/Documento Extranjero.
 */
export function validarDocumentoIdentidad(documento: string): boolean {
    if (!documento || documento.length < 5) return false;
    
    // Si tiene exactamente 10 dígitos y solo números, asumimos que es cédula ecuatoriana y la validamos
    if (/^\d{10}$/.test(documento)) {
        return validarCedula(documento);
    }
    
    // Si tiene letras o diferente longitud, lo aceptamos como pasaporte o documento extranjero
    return true;
}
