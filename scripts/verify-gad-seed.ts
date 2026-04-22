import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TIPO_MUNICIPAL = 'INSTITUCIÓN — NIVEL MUNICIPAL (CANTONES)';

async function main() {
    const provincias = await prisma.provincia.count();
    const cantones = await prisma.canton.count();
    const parroquias = await prisma.parroquia.count();

    const quito = await prisma.canton.findFirst({
        where: { nombre: 'DISTRITO METROPOLITANO DE QUITO' },
        include: { provincia: true }
    });

    const daule = await prisma.canton.findFirst({ where: { nombre: 'DAULE (GUAYAS)' } });
    const bolivarCarchi = await prisma.canton.findFirst({
        where: { nombre: 'BOLÍVAR (CARCHI)' },
        include: { provincia: true }
    });
    const bolivarManabi = await prisma.canton.findFirst({
        where: { nombre: 'BOLÍVAR (MANABÍ)' },
        include: { provincia: true }
    });

    const salitre = await prisma.canton.findMany({
        where: { nombre: 'SALITRE' },
        select: { id: true, provincia: { select: { nombre: true } } }
    });

    const instMunicipal = await prisma.institucionSistema.count({
        where: { tipo: TIPO_MUNICIPAL }
    });

    const bomberos = await prisma.institucionSistema.count({
        where: { tipo: TIPO_MUNICIPAL, nombre: { startsWith: 'CUERPO DE BOMBEROS' } }
    });

    const empresaPublica = await prisma.institucionSistema.count({
        where: { tipo: TIPO_MUNICIPAL, nombre: { startsWith: 'EMPRESA' } }
    });

    const registro = await prisma.institucionSistema.count({
        where: {
            tipo: TIPO_MUNICIPAL,
            OR: [{ nombre: { startsWith: 'REGISTRO' } }, { nombre: { startsWith: 'REGISTRO MUNICIPAL' } }]
        }
    });

    const dobleEspacioBombero = await prisma.institucionSistema.findFirst({
        where: { nombre: 'CUERPO DE BOMBEROS DE  BALAO' }
    });

    const regPuertoQuito = await prisma.institucionSistema.findFirst({
        where: { nombre: 'REGISTRO DE LA PROPIEDAD DE PUERTO QUITO.' }
    });

    console.log(
        JSON.stringify(
            {
                provincias,
                cantones,
                parroquias,
                quito: quito ? { nombre: quito.nombre, provincia: quito.provincia.nombre } : null,
                dauleGuayas: !!daule,
                bolivarCarchi: bolivarCarchi
                    ? { nombre: bolivarCarchi.nombre, prov: bolivarCarchi.provincia.nombre }
                    : null,
                bolivarManabi: bolivarManabi
                    ? { nombre: bolivarManabi.nombre, prov: bolivarManabi.provincia.nombre }
                    : null,
                salitreFilasGuayas: salitre.filter((s) => s.provincia.nombre === 'GUAYAS').length,
                institucionesMunicipales: instMunicipal,
                bomberos,
                empresasPublicasLike: empresaPublica,
                registrosLike: registro,
                bomberoDobleEspacioBalao: !!dobleEspacioBombero,
                registroPuertoQuitoConPunto: !!regPuertoQuito
            },
            null,
            2
        )
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
