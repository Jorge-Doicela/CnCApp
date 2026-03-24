function generateEcuadorianID() {
    const provinceCode = Math.floor(Math.random() * 24) + 1;
    const provinceStr = provinceCode.toString().padStart(2, '0');
    const thirdDigit = Math.floor(Math.random() * 6);
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

for (let i = 0; i < 20; i++) {
    console.log(generateEcuadorianID());
}
