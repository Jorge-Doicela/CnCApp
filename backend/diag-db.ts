import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Testing connection to:', process.env.DATABASE_URL?.replace(/:[^:]+@/, ':****@'));
  
  try {
    console.log('Attempting to query "Usuario" table...');
    const startTime = Date.now();
    const userCount = await prisma.usuario.count();
    console.log(`Success! Found ${userCount} users. Time: ${Date.now() - startTime}ms`);
    
    console.log('Attempting to query "Rol" table...');
    const roles = await prisma.rol.findMany({ take: 5 });
    console.log(`Success! Found ${roles.length} roles.`);
    
  } catch (error) {
    console.error('Database connection failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
