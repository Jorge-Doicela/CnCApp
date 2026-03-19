import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Migration: Standardizing Plantillas ---');

  const plantillas = await prisma.plantilla.findMany();
  
  for (const p of plantillas) {
    // 1. Convert absolute or broken URLs to standard relative paths
    let newImageUrl = p.imagenUrl;
    if (!newImageUrl || newImageUrl.includes('/assets/templates/') || newImageUrl.includes('placehold.co')) {
      newImageUrl = '/uploads/plantillas/92850c1d-6ede-4f7c-8bea-020af569ff0c.jpeg';
    } else if (newImageUrl.startsWith('http://localhost:3000')) {
      newImageUrl = newImageUrl.replace('http://localhost:3000', '');
    }

    // 2. Standardize configuration
    const newConfig = {
      nombreUsuario: { x: 420, y: 300, fontSize: 32, color: '#1a1a1a' },
      curso: { x: 420, y: 370, fontSize: 18, color: '#333333' },
      fecha: { x: 420, y: 450, fontSize: 14, color: '#666666' }
    };

    await prisma.plantilla.update({
      where: { id: p.id },
      data: {
        imagenUrl: newImageUrl,
        configuracion: newConfig
      }
    });
    
    console.log(`[OK] Standardized: ${p.nombre} -> ${newImageUrl}`);
  }

  console.log('--- Migration Finished Successfully ---');
}

main()
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
