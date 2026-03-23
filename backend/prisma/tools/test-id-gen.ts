/**
 * Generates a valid Ecuadorian ID (cédula) using the modulo 10 algorithm.
 */
function generateEcuadorianID(): string {
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
 * Validates an Ecuadorian ID.
 */
function validateID(id: string): boolean {
    if (id.length !== 10) return false;
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

// Test generation
for (let i = 0; i < 10; i++) {
    const id = generateEcuadorianID();
    console.log(`Generated: ${id}, Valid: ${validateID(id)}`);
}
