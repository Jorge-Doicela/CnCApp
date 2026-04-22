const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema='public'
        AND table_name ILIKE '%gad%prov%'
      ORDER BY table_name;
    `);
    console.log('Tablas relacionadas a gad/prov:', rows);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

