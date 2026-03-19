const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Force updating plantillas with public placeholder...');
  const defaultImageUrl = `https://placehold.co/842x595?text=Plantilla+CNC`;
  
  const plantillas = await prisma.plantilla.findMany();
  
  for (const p of plantillas) {
    const newConfig = {
      nombreUsuario: { x: 420, y: 300, fontSize: 32, color: '#1a1a1a' },
      curso: { x: 420, y: 370, fontSize: 18, color: '#333333' },
      fecha: { x: 420, y: 450, fontSize: 14, color: '#666666' }
    };
    
    await prisma.plantilla.update({
      where: { id: p.id },
      data: {
        imagenUrl: defaultImageUrl,
        configuracion: newConfig
      }
    });
    console.log(`Updated: ${p.nombre}`);
  }
}

main()
  .then(() => { console.log('Successfully updated all plantillas'); process.exit(0); })
  .catch(err => { console.error('Error:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
