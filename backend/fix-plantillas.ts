import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing plantillas data...');

  const baseUrl = 'http://localhost:3000';
  const defaultImageUrl = `${baseUrl}/uploads/plantillas/92850c1d-6ede-4f7c-8bea-020af569ff0c.jpeg`;
  
  // Since I couldn't copy default.png yet, I'll use the existing file I found
  // or I'll try to find another one.
  
  const plantillas = await prisma.plantilla.findMany();
  
  for (const p of plantillas) {
    let newConfig = p.configuracion as any;
    
    // Check if it's the old seed format
    if (newConfig && newConfig.elements) {
      newConfig = {
        nombreUsuario: { x: 420, y: 300, fontSize: 32, color: '#1a1a1a' },
        curso: { x: 420, y: 370, fontSize: 18, color: '#333333' },
        fecha: { x: 420, y: 450, fontSize: 14, color: '#666666' }
      };
    } else if (!newConfig || Object.keys(newConfig).length === 0) {
      newConfig = {
        nombreUsuario: { x: 420, y: 300, fontSize: 32, color: '#1a1a1a' },
        curso: { x: 420, y: 370, fontSize: 18, color: '#333333' },
        fecha: { x: 420, y: 450, fontSize: 14, color: '#666666' }
      };
    }
    
    await prisma.plantilla.update({
      where: { id: p.id },
      data: {
        imagenUrl: defaultImageUrl,
        configuracion: newConfig
      }
    });
    console.log(`Updated plantilla: ${p.nombre}`);
  }

  console.log('Done.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
