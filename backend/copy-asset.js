const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../frontend/src/assets/certificados/plantilla.png');
const destDir = path.resolve(__dirname, 'public/uploads/plantillas');
const dest = path.join(destDir, 'default.png');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

try {
    fs.copyFileSync(src, dest);
    console.log('Successfully copied template image to ' + dest);
} catch (err) {
    console.error('Error copying file:', err);
}
