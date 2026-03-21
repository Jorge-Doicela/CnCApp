/**
 * Genera prisma/data/gad-parroquias.json desde un archivo de texto que contiene
 * líneas tipo:    ('NOMBRE'),
 * Uso: node prisma/tools/parse-gad-parroquias-sql.mjs < prisma/tools/gad-parroquias-source.sql
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outPath = path.join(root, 'data', 'gad-parroquias.json');

const stdin = fs.readFileSync(0, 'utf8');
const names = [];
const re = /\('((?:\\'|[^'])*)'\)/g;
let m;
while ((m = re.exec(stdin)) !== null) {
    names.push(m[1].replace(/\\'/g, "'"));
}

if (names.length === 0) {
    console.error('No se encontraron tuplas (\'...\'). Pegue el bloque INSERT en stdin o en gad-parroquias-source.sql');
    process.exit(1);
}

fs.writeFileSync(outPath, JSON.stringify(names, null, 0), 'utf8');
console.log(`Escritas ${names.length} parroquias GAD en ${outPath}`);
