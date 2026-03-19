const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, '../backend/public/fonts');

if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

const fonts = [
    { name: 'GreatVibes-Regular.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/greatvibes/GreatVibes-Regular.ttf' },
    { name: 'Montserrat-Regular.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/static/Montserrat-Regular.ttf' },
    { name: 'Montserrat-Bold.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/static/Montserrat-Bold.ttf' },
    { name: 'PlayfairDisplay-Regular.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/static/PlayfairDisplay-Regular.ttf' }
];

async function download() {
    for (const font of fonts) {
        const dest = path.join(fontsDir, font.name);
        console.log(`Downloading ${font.name}...`);
        await new Promise((resolve, reject) => {
            const file = fs.createWriteStream(dest);
            https.get(font.url, response => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            }).on('error', err => {
                fs.unlink(dest, () => {});
                reject(err);
            });
        });
    }
    console.log("All fonts downloaded successfully.");
}

download().catch(console.error);
