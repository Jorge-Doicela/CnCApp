import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando actualización manual de esquema para Provincias, Cantones y Parroquias...');

  try {
    // 1. Actualizar Provincias
    console.log('--- Actualizando tabla "provincias" ---');
    await prisma.$executeRawUnsafe(`ALTER TABLE "provincias" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50) UNIQUE`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "provincias" ADD COLUMN IF NOT EXISTS "estado" BOOLEAN DEFAULT true`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "provincias" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "provincias" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`);

    // 2. Actualizar Cantones
    console.log('--- Actualizando tabla "cantones" ---');
    await prisma.$executeRawUnsafe(`ALTER TABLE "cantones" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50) UNIQUE`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "cantones" ADD COLUMN IF NOT EXISTS "estado" BOOLEAN DEFAULT true`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "cantones" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "cantones" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`);

    // 3. Actualizar Parroquias
    console.log('--- Actualizando tabla "parroquias" ---');
    await prisma.$executeRawUnsafe(`ALTER TABLE "parroquias" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50) UNIQUE`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "parroquias" ADD COLUMN IF NOT EXISTS "estado" BOOLEAN DEFAULT true`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "parroquias" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "parroquias" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`);

    console.log('✅ Columnas agregadas exitosamente.');
  } catch (error) {
    console.error('❌ Error ejecutando SQL manual:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
