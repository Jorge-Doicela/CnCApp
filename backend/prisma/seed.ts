import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log(' Iniciando seed de base de datos...');

    // Limpiar datos existentes (opcional, comentar en producción)
    // await prisma.usuario.deleteMany();
    // await prisma.rol.deleteMany();
    // await prisma.entidad.deleteMany();
    // await prisma.provincia.deleteMany();

    // 1. Crear Roles
    console.log(' Creando roles...');
    const adminRole = await prisma.rol.upsert({
        where: { nombre: 'Administrador' },
        update: {},
        create: {
            nombre: 'Administrador',
            descripcion: 'Acceso total al sistema',
            modulos: [
                'Gestionar roles',
                'Gestionar usuarios',
                'Gestionar capacitaciones',
                'Gestionar entidades',
                'Gestionar provincias',
                'Gestionar cantones',
                'Gestionar parroquias',
                'Gestionar competencias',
                'Gestionar instituciones',
                'Ver Perfil',
                'Ver conferencias',
                'Ver certificaciones',
                'Validar certificados'
            ]
        }
    });

    const userRole = await prisma.rol.upsert({
        where: { nombre: 'Usuario Regular' },
        update: {},
        create: {
            nombre: 'Usuario Regular',
            descripcion: 'Acceso básico al sistema',
            modulos: [
                'Ver Perfil',
                'Ver conferencias',
                'Ver certificaciones'
            ]
        }
    });

    console.log(` Roles creados: ${adminRole.nombre}, ${userRole.nombre}`);

    // 2. Crear Entidad Principal
    console.log(' Creando entidad principal...');
    const cncEntidad = await prisma.entidad.upsert({
        where: { id: 1 },
        update: {},
        create: {
            nombre: 'CNC - Consejo Nacional de Competencias'
        }
    });

    console.log(` Entidad creada: ${cncEntidad.nombre}`);

    // 3. Crear Usuarios de Prueba
    console.log(' Creando usuarios de prueba...');
    const hashedPassword = await bcrypt.hash('CncSecure2025!', 10);

    const adminUser = await prisma.usuario.upsert({
        where: { ci: '1234567890' },
        update: {},
        create: {
            nombre: 'Administrador CNC',
            ci: '1234567890',
            email: 'admin@cnc.gob.ec',
            telefono: '0999999999',
            password: hashedPassword,
            rolId: adminRole.id,
            entidadId: cncEntidad.id,
            tipoParticipante: 0
        }
    });

    const regularUser = await prisma.usuario.upsert({
        where: { ci: '0987654321' },
        update: {},
        create: {
            nombre: 'Juan Pérez',
            ci: '0987654321',
            email: 'juan@example.com',
            telefono: '0988888888',
            password: hashedPassword,
            rolId: userRole.id,
            entidadId: cncEntidad.id,
            tipoParticipante: 1
        }
    });

    console.log(` Usuarios creados: ${adminUser.nombre}, ${regularUser.nombre}`);

    // 4. Crear Provincias de Ecuador
    console.log('  Creando provincias de Ecuador...');
    const provincias = [
        'Azuay', 'Bolívar', 'Cañar', 'Carchi',
        'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas',
        'Galápagos', 'Guayas', 'Imbabura', 'Loja',
        'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo',
        'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena',
        'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
    ];

    for (const nombreProvincia of provincias) {
        await prisma.provincia.upsert({
            where: { nombre: nombreProvincia },
            update: {},
            create: { nombre: nombreProvincia }
        });
    }

    console.log(` ${provincias.length} provincias creadas`);

    // 5. Crear Competencias Iniciales
    console.log(' Creando competencias iniciales...');
    const competencias = [
        'Gestión Pública',
        'Planificación Territorial',
        'Desarrollo Local',
        'Administración de Recursos'
    ];

    for (const nombreCompetencia of competencias) {
        await prisma.competencia.upsert({
            where: { nombre: nombreCompetencia },
            update: {},
            create: { nombre: nombreCompetencia }
        });
    }

    console.log(` ${competencias.length} competencias creadas`);

    // 6. Crear Instituciones del Sistema
    console.log('  Creando instituciones del sistema...');
    const instituciones = [
        { nombre: 'Ministerio de Educación', tipo: 'Ministerio' },
        { nombre: 'Ministerio de Salud', tipo: 'Ministerio' },
        { nombre: 'GAD Municipal', tipo: 'Gobierno Autónomo Descentralizado' },
        { nombre: 'GAD Provincial', tipo: 'Gobierno Autónomo Descentralizado' }
    ];

    for (const inst of instituciones) {
        await prisma.institucionSistema.upsert({
            where: { nombre: inst.nombre },
            update: {},
            create: inst
        });
    }

    console.log(` ${instituciones.length} instituciones creadas`);

    // 7. Crear Cargos Iniciales
    console.log(' Creando cargos iniciales...');
    const cargos = [
        'Director',
        'Coordinador',
        'Técnico',
        'Asistente Administrativo'
    ];

    for (const nombreCargo of cargos) {
        await prisma.cargo.upsert({
            where: { nombre: nombreCargo },
            update: {},
            create: { nombre: nombreCargo }
        });
    }

    console.log(` ${cargos.length} cargos creados`);

    console.log('\n  Seed completado exitosamente!');
    console.log('\n  Resumen:');
    console.log(`   - Roles: 2`);
    console.log(`   - Entidades: 1`);
    console.log(`   - Usuarios: 2 (password: CncSecure2025!)`);
    console.log(`   - Provincias: ${provincias.length}`);
    console.log(`   - Competencias: ${competencias.length}`);
    console.log(`   - Instituciones: ${instituciones.length}`);
    console.log(`   - Cargos: ${cargos.length}`);
    console.log('\n  Credenciales de prueba:');
    console.log('   Admin: CI 1234567890 / Password: CncSecure2025!');
    console.log('   Usuario: CI 0987654321 / Password: CncSecure2025!');
}

main()
    .catch((e) => {
        console.error(' Error durante el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
