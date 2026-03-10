const http = require('http');
http.get('http://localhost:3000/api/public/entidades', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const arr = JSON.parse(data);
        console.log(arr.map(x => Object.keys(x)));
    });
}).on('error', (err) => { console.log('Error: ' + err.message); });
