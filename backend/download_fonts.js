const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, 'public', 'fonts');
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

const fonts = [
    { name: 'Inter-Regular.ttf', url: 'https://cdn.jsdelivr.net/gh/rsms/inter@v3.19/docs/font-files/Inter-Regular.ttf' },
    { name: 'Inter-Bold.ttf', url: 'https://cdn.jsdelivr.net/gh/rsms/inter@v3.19/docs/font-files/Inter-Bold.ttf' }
];

async function downloadFont(font) {
    const dest = path.join(fontsDir, font.name);
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        
        function handleResponse(response) {
            if (response.statusCode === 301 || response.statusCode === 302) {
                https.get(response.headers.location, handleResponse).on('error', (err) => {
                    fs.unlink(dest, () => {});
                    console.error(`Error downloading ${font.name} after redirect: ${err.message}`);
                    resolve(false);
                });
                return;
            }

            if (response.statusCode !== 200) {
                console.error(`Failed to download ${font.name}: ${response.statusCode}`);
                resolve(false);
                return;
            }
            
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${font.name}`);
                resolve(true);
            });
        }

        https.get(font.url, handleResponse).on('error', (err) => {
            fs.unlink(dest, () => {});
            console.error(`Error downloading ${font.name}: ${err.message}`);
            resolve(false);
        });
    });
}

async function run() {
    console.log('Final Inter restore...');
    for (const font of fonts) {
        await downloadFont(font);
    }
    console.log('All downloads finished.');
}

run();
