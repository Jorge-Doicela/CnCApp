/**
 * Compara tipo_institucion y regimen_especial en BD con los INSERT SQL de referencia.
 */
const { PrismaClient } = require('@prisma/client');

const EXPECTED_TIPOS = [
  'PROVINCIAL',
  'MUNICIPAL',
  'PARROQUIAL RURAL',
  'GREMIOS',
  'CENTRAL',
  'OTRAS INSTITUCIONES DEL ESTADO',
  'COOPERANTES',
  'ACADEMIA',
  'EDUCACIÓN GENERAL BÁSICA Y BACHILLERATO',
  'PRIVADO',
  'CIUDADANÍA',
  'MANCOMUNIDADES Y CONSORCIOS',
  'RÉGIMEN ESPECIAL',
];

const EXPECTED_REGIMEN = 'CONSEJO DE GOBIERNO DE RÉGIMEN ESPECIAL DE GALÁPAGOS';

async function main() {
  const prisma = new PrismaClient();
  try {
    const tipos = await prisma.tipoInstitucion.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, nombre: true },
    });
    const regimenes = await prisma.regimenEspecial.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, nombre: true },
    });

    const nombresTipos = tipos.map((t) => t.nombre);
    const faltanTipos = EXPECTED_TIPOS.filter((n) => !nombresTipos.includes(n));
    const extraTipos = nombresTipos.filter((n) => !EXPECTED_TIPOS.includes(n));

    console.log('=== tipo_institucion ===');
    console.log('Filas en BD:', tipos.length, '| Esperadas:', EXPECTED_TIPOS.length);
    if (faltanTipos.length) console.log('FALTAN:', faltanTipos);
    if (extraTipos.length) console.log('EXTRA (no en tu SQL):', extraTipos);
    if (!faltanTipos.length && !extraTipos.length && tipos.length === EXPECTED_TIPOS.length) {
      console.log('OK: coincide exactamente con tu lista SQL.');
    }
    console.log('Listado:', nombresTipos.join(' | '));

    console.log('\n=== regimen_especial ===');
    console.log('Filas en BD:', regimenes.length);
    const tieneGalapagos = regimenes.some((r) => r.nombre === EXPECTED_REGIMEN);
    if (tieneGalapagos) {
      console.log('OK: existe el registro de Galápagos.');
    } else {
      console.log('FALTA:', EXPECTED_REGIMEN);
      console.log('En BD:', regimenes.map((r) => r.nombre));
    }

    const ok =
      faltanTipos.length === 0 &&
      extraTipos.length === 0 &&
      tipos.length === EXPECTED_TIPOS.length &&
      tieneGalapagos;

    process.exitCode = ok ? 0 : 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
