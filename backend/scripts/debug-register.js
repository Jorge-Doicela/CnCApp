const fetch = require('node-fetch'); // Need to require if running with node (wait, removed import?? need simple fetch)
// Node 24 has fetch.
const fs = require('fs');

async function run() {
    const uniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const body = {
        ci: `99${uniqueId}`,
        nombre: `Debug User ${uniqueId}`,
        email: `debug_${uniqueId}@test.com`,
        password: 'Pass123!',
        telefono: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        tipoParticipante: 2
    };

    console.log('Sending:', body);

    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        console.log('Status:', res.status);
        fs.writeFileSync('debug_res.json', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

run().catch(console.error);
