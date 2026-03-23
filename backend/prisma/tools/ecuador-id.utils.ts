/**
 * Utility to generate and validate Ecuadorian ID (cédula) numbers using the modulo 10 algorithm.
 */

/**
 * Generates a valid Ecuadorian ID (cédula) using the modulo 10 algorithm.
 * 
 * Rules:
 * - First two digits represent the province (01 to 24).
 * - Third digit must be less than 6.
 * - Digits 4 to 9 are sequential or random.
 * - The last digit is the check digit.
 * 
 * @returns A 10-digit string representing a valid Ecuadorian ID.
 */
export function generateEcuadorianID(): string {
    const provinceCode = Math.floor(Math.random() * 24) + 1;
    const provinceStr = provinceCode.toString().padStart(2, '0');
    
    // Third digit < 6
    const thirdDigit = Math.floor(Math.random() * 6);
    
    // 6 sequential/random digits
    let id = provinceStr + thirdDigit;
    for (let i = 0; i < 6; i++) {
        id += Math.floor(Math.random() * 10);
    }
    
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
        let val = parseInt(id[i]) * coefficients[i];
        if (val >= 10) val -= 9;
        sum += val;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return id + checkDigit;
}

/**
 * Validates an Ecuadorian ID using the modulo 10 algorithm.
 * 
 * @param id The 10-digit ID string to validate.
 * @returns True if the ID is valid according to the algorithm.
 */
export function validateEcuadorianID(id: string): boolean {
    if (!id || id.length !== 10 || isNaN(Number(id))) return false;
    
    const province = parseInt(id.substring(0, 2));
    if (province < 1 || province > 24) return false;
    
    const thirdDigit = parseInt(id[2]);
    if (thirdDigit >= 6) return false;
    
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        let val = parseInt(id[i]) * coefficients[i];
        if (val >= 10) val -= 9;
        sum += val;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return parseInt(id[9]) === checkDigit;
}
