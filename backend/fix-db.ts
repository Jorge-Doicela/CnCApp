
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Intentando conectar a la base de datos...');
    await prisma.$connect();
    console.log('Conectado. Ejecutando actualización de esquema...');
    
    // Añadir la columna biometric_token si no existe
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "usuarios" 
      ADD COLUMN IF NOT EXISTS "biometric_token" VARCHAR(550);
    `);
    
    console.log('✅ Esquema actualizado con éxito.');
  } catch (error) {
    console.error('❌ Error actualizando la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
