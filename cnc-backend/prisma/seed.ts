import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de la base de datos...');

    try {
        // 1. Crear Roles
        console.log('📝 Creando roles...');
        const adminRole = await prisma.rol.create({
            data: {
                nombre: 'Administrador',
                descripcion: 'Acceso total al sistema',
                modulos: [
                    'Gestionar roles',
                    'Gestionar usuarios',
                    'Gestionar capacitaciones'
                ]
            }
        });

        const userRole = await prisma.rol.create({
            data: {
                nombre: 'Usuario Regular',
                descripcion: 'Acceso básico para participantes',
                modulos: ['Ver Perfil', 'Ver conferencias']
            }
        });

        console.log('✅ Roles creados');

        // 2. Crear Entidad
        console.log('📝 Creando entidad...');
        const entidad = await prisma.entidad.create({
            data: {
                nombre: 'CNC - Consejo Nacional de Competencias'
            }
        });

        console.log('✅ Entidad creada');

        // 3. Crear Usuario Administrador
        console.log('📝 Creando usuario administrador...');
        const hashedPassword = await bcrypt.hash('123456', 10);

        const adminUser = await prisma.usuario.create({
            data: {
                nombre: 'Administrador CNC',
                ci: '1234567890',
                email: 'admin@cnc.gob.ec',
                telefono: '0999999999',
                password: hashedPassword,
                rolId: adminRole.id,
                entidadId: entidad.id,
                tipoParticipante: 0
            }
        });

        console.log('✅ Usuario admin creado');

        // 4. Crear Usuario Regular
        console.log('📝 Creando usuario regular...');
        const userPassword = await bcrypt.hash('123456', 10);

        const regularUser = await prisma.usuario.create({
            data: {
                nombre: 'Juan Pérez',
                ci: '0987654321',
                email: 'juan@example.com',
                telefono: '0988888888',
                password: userPassword,
                rolId: userRole.id,
                entidadId: entidad.id,
                tipoParticipante: 1
            }
        });

        console.log('✅ Usuario regular creado');

        // 5. Crear Provincias de Ecuador
        console.log('📝 Creando provincias de Ecuador...');
        const provincias = [
            'Azuay', 'Bolívar', 'Cañar', 'Carchi',
            'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas',
            'Galápagos', 'Guayas', 'Imbabura', 'Loja',
            'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo',
            'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena',
            'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
        ];

        for (const provincia of provincias) {
            await prisma.provincia.create({
                data: { nombre: provincia }
            });
        }

        console.log('✅ Provincias creadas:', provincias.length);

        console.log('\n🎉 Seed completado exitosamente!\n');
        console.log('📋 Credenciales de prueba:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👤 Administrador:');
        console.log('   CI: 1234567890');
        console.log('   Password: 123456');
        console.log('');
        console.log('👤 Usuario Regular:');
        console.log('   CI: 0987654321');
        console.log('   Password: 123456');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error: any) {
        if (error.code === 'P2002') {
            console.log('⚠️  Los datos ya existen en la base de datos');
            console.log('\n📋 Credenciales de prueba:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('👤 Administrador:');
            console.log('   CI: 1234567890');
            console.log('   Password: 123456');
            console.log('');
            console.log('👤 Usuario Regular:');
            console.log('   CI: 0987654321');
            console.log('   Password: 123456');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        } else {
            throw error;
        }
    }
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
