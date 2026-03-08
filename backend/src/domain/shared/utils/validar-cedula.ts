/**
 * Validador de Cédula Ecuatoriana (Algoritmo de Módulo 10)
 */
export function validarCedula(cedula: string): boolean {
    if (!cedula) return false;
    if (cedula.length !== 10) return false;
    if (!/^\d+$/.test(cedula)) return false;

    // Primeros dos dígitos: provincia (01-24, o 30 para extranjeros residentes)
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) {
        return false;
    }

    // Tercer dígito: menor a 6
    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito >= 6) {
        return false;
    }

    // Algoritmo de Módulo 10
    const digitoVerificador = parseInt(cedula.substring(9, 10), 10);
    let suma = 0;
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];

    for (let i = 0; i < 9; i++) {
        let valor = parseInt(cedula.substring(i, i + 1), 10) * coeficientes[i];
        if (valor >= 10) {
            valor -= 9;
        }
        suma += valor;
    }

    const total = (Math.ceil(suma / 10) * 10);
    let resultado = total - suma;

    if (resultado === 10) {
        resultado = 0;
    }

    return resultado === digitoVerificador;
}
