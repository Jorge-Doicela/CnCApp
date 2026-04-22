const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'gad_municipios',
          'tipo_institucion',
          'instituciones_sistema',
          'provincias',
          'cantones',
          'parroquias'
        )
      ORDER BY table_name;
    `);
    console.log('geo tables rows:', rows);

    const provincias = await prisma.provincia.findMany({
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true }
    });

    console.log('provincias count:', provincias.length);
    console.log('provincias:', provincias.map((p) => p.nombre));

    const ejemplos = [
      'EMPRESA CANTONAL DE AGUA POTABLE Y ALCANTARILLADO DE GUAYAQUIL - ECAPAG',
      'CUERPO DE BOMBEROS ALFREDO BAQUERIZO MORENO JUJAN',
      'REGISTRO DE LA PROPIEDAD DE PUERTO QUITO'
    ];

    const totalInstituciones = await prisma.institucionSistema.count();
    console.log('instituciones_sistema count:', totalInstituciones);

    const institExistentes = await prisma.institucionSistema.findMany({
      where: { nombre: { in: ejemplos } },
      select: { nombre: true, tipo: true }
    });
    console.log('instituciones (ejemplos):', institExistentes);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

