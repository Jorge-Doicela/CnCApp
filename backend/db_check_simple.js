const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.rol.findMany().then(r => {
  console.log('--- ROLES IN DB ---');
  r.forEach(rol => {
    console.log(`Role: ${rol.nombre}, Modules: ${JSON.stringify(rol.modulos)}`);
  });
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
