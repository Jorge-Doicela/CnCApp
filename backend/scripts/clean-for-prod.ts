import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('--- INICIANDO LIMPIEZA PROFUNDA PARA ENTREGA ---');

  try {
    // 1. Borrar registros dependientes primero (Certificados e Inscripciones)
    console.log('Borrando certificados...');
    await prisma.certificado.deleteMany({});
    
    console.log('Borrando inscripciones y asistencias (UsuarioCapacitacion)...');
    await prisma.usuarioCapacitacion.deleteMany({});
    
    // 2. Borrar capacitaciones
    console.log('Borrando capacitaciones...');
    await prisma.capacitacion.deleteMany({});

    // 3. Borrar perfiles adicionales de usuarios
    console.log('Borrando perfiles extendidos (Autoridades, Funcionarios, etc.)...');
    await prisma.institucionUsuario.deleteMany({});
    await prisma.autoridad.deleteMany({});
    await prisma.funcionarioGAD.deleteMany({});

    // 4. Borrar usuarios de prueba (excepto admin@cnc.gob.ec)
    console.log('Borrando usuarios de prueba (excepto admin@cnc.gob.ec)...');
    const deleteResult = await prisma.usuario.deleteMany({
      where: {
        NOT: {
          email: 'admin@cnc.gob.ec'
        }
      }
    });
    console.log(`Usuarios eliminados: ${deleteResult.count}`);

    console.log('--- LIMPIEZA COMPLETADA CON ÉXITO ---');
    console.log('La aplicación ahora está lista para ser entregada.');
  } catch (error) {
    console.error('Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
