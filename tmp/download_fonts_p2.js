const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, '../backend/public/fonts');

if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

const fonts = [
    { name: 'Poppins-Regular.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf' },
    { name: 'Poppins-Bold.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf' },
    { name: 'Inter-Regular.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/static/Inter-Regular.ttf' },
    { name: 'Inter-Bold.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/static/Inter-Bold.ttf' }
];

async function download() {
    for (const font of fonts) {
        const dest = path.join(fontsDir, font.name);
        console.log(`Downloading ${font.name}...`);
        await new Promise((resolve, reject) => {
            const file = fs.createWriteStream(dest);
            https.get(font.url, response => {
                if(response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close(resolve);
                    });
                } else if(response.statusCode === 301 || response.statusCode === 302) {
                     https.get(response.headers.location, redirectResponse => {
                         redirectResponse.pipe(file);
                         file.on('finish', () => file.close(resolve));
                     });
                } else {
                    reject(new Error(`Failed to download ${font.url}: ${response.statusCode}`));
                }
            }).on('error', err => {
                fs.unlink(dest, () => {});
                reject(err);
            });
        });
    }
    console.log("Poppins and Inter fonts downloaded successfully.");
}

download().catch(console.error);
