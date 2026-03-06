const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
const icons = new Set();
files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const regex = /<ion-icon[^>]*name=["']([^"']+)["'][^>]*>/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        icons.add(match[1]);
    }
});

const camelCased = Array.from(icons).map(i => {
    return i.split('-').map((p, idx) => idx === 0 ? p : p[0].toUpperCase() + p.slice(1)).join('');
});

console.log(camelCased.join(', '));
