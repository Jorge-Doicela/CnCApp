import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ecuadorData } from './data/ecuador-data';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
    console.log('🌱 Starting COMPLETE database seed (Real Ecuador Data)...');
    console.log('⚠️  This will DELETE all existing data and create fresh seed data\n');

    try {
        // ============================================
        // STEP 0: CLEAN DATABASE
        // ============================================
        console.log('🗑️  Cleaning database...');

        // Delete in correct order (respecting foreign keys)
        await prisma.certificado.deleteMany({});
        await prisma.usuarioCapacitacion.deleteMany({});
        await prisma.capacitacion.deleteMany({});
        await prisma.plantilla.deleteMany({});
        await prisma.institucionUsuario.deleteMany({});
        await prisma.funcionarioGAD.deleteMany({});
        await prisma.autoridad.deleteMany({});
        await prisma.usuario.deleteMany({});
        await prisma.parroquia.deleteMany({});
        await prisma.canton.deleteMany({});
        await prisma.provincia.deleteMany({});
        await prisma.entidad.deleteMany({});
        await prisma.rol.deleteMany({});
        await prisma.mancomunidad.deleteMany({});
        await prisma.institucionSistema.deleteMany({});
        await prisma.cargo.deleteMany({});
        await prisma.competencia.deleteMany({});

        console.log('✅ Database cleaned\n');

        // ============================================
        // STEP 1: ROLES
        // ============================================
        console.log('👥 Creating roles...');
        const adminRole = await prisma.rol.create({
            data: {
                nombre: 'Administrador',
                descripcion: 'Administrador del sistema con acceso completo',
                modulos: ['usuarios', 'capacitaciones', 'certificados', 'reportes', 'configuracion'],
            },
        });

        const conferencistaRole = await prisma.rol.create({
            data: {
                nombre: 'Conferencista',
                descripcion: 'Creador de conferencias con capacidad de gestionar capacitaciones y generar certificados',
                modulos: ['capacitaciones', 'certificados', 'inscripciones'],
            },
        });

        const usuarioRole = await prisma.rol.create({
            data: {
                nombre: 'Usuario',
                descripcion: 'Usuario del sistema que puede crear cuenta, editar datos, visualizar capacitaciones y descargar certificados',
                modulos: ['perfil', 'capacitaciones-lectura', 'certificados-propios'],
            },
        });
        console.log('✅ Roles created\n');

        // ============================================
        // STEP 2: GEOGRAPHIC DATA (Ecuador)
        // ============================================
        console.log('Map  Creating geographic data (Provincias > Cantones > Parroquias)...');

        let totalProvincias = 0;
        let totalCantones = 0;
        let totalParroquias = 0;

        for (const provData of ecuadorData) {
            // Crear Provincia
            const provincia = await prisma.provincia.create({
                data: { nombre: provData.provincia }
            });
            totalProvincias++;
            process.stdout.write(`.`); // Progress indicator

            if (provData.cantones && provData.cantones.length > 0) {
                for (const cantData of provData.cantones) {
                    // Crear Canton
                    const canton = await prisma.canton.create({
                        data: {
                            nombre: cantData.nombre,
                            provinciaId: provincia.id
                        }
                    });
                    totalCantones++;

                    if (cantData.parroquias && cantData.parroquias.length > 0) {
                        // Crear Parroquias (Batch insert for speed)
                        const parroquiasData = cantData.parroquias.map(pName => ({
                            nombre: pName,
                            cantonId: canton.id
                        }));

                        await prisma.parroquia.createMany({
                            data: parroquiasData
                        });
                        totalParroquias += parroquiasData.length;
                    }
                }
            }
        }

        console.log('\n✅ Geographic data created:');
        console.log(`   - ${totalProvincias} Provincias`);
        console.log(`   - ${totalCantones} Cantones`);
        console.log(`   - ${totalParroquias} Parroquias\n`);

        // Get key provinces/cantons for user seeding references
        const pichincha = await prisma.provincia.findFirst({ where: { nombre: 'PICHINCHA' } });
        const guayas = await prisma.provincia.findFirst({ where: { nombre: 'GUAYAS' } });
        const azuay = await prisma.provincia.findFirst({ where: { nombre: 'AZUAY' } });

        const quito = await prisma.canton.findFirst({ where: { nombre: 'QUITO' } });
        const guayaquil = await prisma.canton.findFirst({ where: { nombre: 'GUAYAQUIL' } });
        const cuenca = await prisma.canton.findFirst({ where: { nombre: 'CUENCA' } });


        // ============================================
        // STEP 3: ADMINISTRATIVE CATALOGS
        // ============================================
        console.log('📋 Creating administrative catalogs...');

        // Cargos
        await prisma.cargo.createMany({
            data: [
                { nombre: 'ALCALDE/ALCALDESA' },
                { nombre: 'PREFECTO/PREFECTA' },
                { nombre: 'DIRECTOR/DIRECTORA' },
                { nombre: 'COORDINADOR/COORDINADORA' },
                { nombre: 'ANALISTA' },
                { nombre: 'TÉCNICO/TÉCNICA' },
                { nombre: 'ASISTENTE' },
                { nombre: 'GERENTE' },
                { nombre: 'JEFE/JEFA DE DEPARTAMENTO' },
                { nombre: 'ASESOR/ASESORA' },
            ]
        });

        // Competencias
        await prisma.competencia.createMany({
            data: [
                { nombre_competencias: 'PLANIFICACIÓN TERRITORIAL' },
                { nombre_competencias: 'GESTIÓN AMBIENTAL' },
                { nombre_competencias: 'VIALIDAD' },
                { nombre_competencias: 'AGUA POTABLE Y SANEAMIENTO' },
                { nombre_competencias: 'GESTIÓN DE RIESGOS' },
                { nombre_competencias: 'TRÁNSITO Y TRANSPORTE' },
                { nombre_competencias: 'PATRIMONIO CULTURAL' },
                { nombre_competencias: 'DESARROLLO ECONÓMICO' },
            ]
        });

        // Instituciones del Sistema
        await prisma.institucionSistema.createMany({
            data: [
                { nombre: 'CONSEJO NACIONAL DE COMPETENCIAS', tipo: 'NACIONAL' },
                { nombre: 'ASOCIACIÓN DE MUNICIPALIDADES DEL ECUADOR - AME', tipo: 'ASOCIACION' },
                { nombre: 'CONSORCIO DE GOBIERNOS AUTÓNOMOS PROVINCIALES DEL ECUADOR - CONGOPE', tipo: 'CONSORCIO' },
                { nombre: 'CONSEJO NACIONAL DE GOBIERNOS PARROQUIALES RURALES DEL ECUADOR - CONAGOPARE', tipo: 'CONSORCIO' },
                { nombre: 'SECRETARÍA TÉCNICA PLANIFICA ECUADOR', tipo: 'NACIONAL' },
            ]
        });

        console.log('✅ Administrative catalogs created\n');

        // ============================================
        // STEP 4: ENTITIES
        // ============================================
        console.log('🏢 Creating entities...');
        const cncEntity = await prisma.entidad.create({
            data: { nombre: 'Consejo Nacional de Competencias' }
        });

        const gadQuito = await prisma.entidad.create({
            data: { nombre: 'GAD Municipal de Quito' }
        });

        const gadGuayaquil = await prisma.entidad.create({
            data: { nombre: 'GAD Municipal de Guayaquil' }
        });

        const gadCuenca = await prisma.entidad.create({
            data: { nombre: 'GAD Municipal de Cuenca' }
        });

        const gadPichincha = await prisma.entidad.create({
            data: { nombre: 'GAD Provincial de Pichincha' }
        });

        console.log('✅ Entities created\n');

        // ============================================
        // STEP 5: USERS
        // ============================================
        console.log('👤 Creating users...');
        const plainPassword = 'AdminPassword123!';
        const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

        // ADMINISTRADOR
        const adminUser = await prisma.usuario.create({
            data: {
                ci: '1234567890',
                nombre: 'Administrador CNC',
                primerNombre: 'Juan',
                primerApellido: 'Administrador',
                email: 'admin@cnc.gob.ec',
                telefono: '0999999999',
                password: hashedPassword,
                rolId: adminRole.id,
                entidadId: cncEntity.id,
                tipoParticipante: 0,
            },
        });

        // EXPOSITORES/CONFERENCISTAS
        const expositor1 = await prisma.usuario.create({
            data: {
                ci: '0987654321',
                nombre: 'Dr. Carlos Mendoza',
                primerNombre: 'Carlos',
                primerApellido: 'Mendoza',
                email: 'carlos.mendoza@cnc.gob.ec',
                telefono: '0988888888',
                password: hashedPassword,
                rolId: conferencistaRole.id,
                entidadId: cncEntity.id,
                tipoParticipante: 0,
            },
        });

        const expositor2 = await prisma.usuario.create({
            data: {
                ci: '1357924680',
                nombre: 'Dra. María López',
                primerNombre: 'María',
                primerApellido: 'López',
                email: 'maria.lopez@cnc.gob.ec',
                telefono: '0977777777',
                password: hashedPassword,
                rolId: conferencistaRole.id,
                entidadId: cncEntity.id,
                tipoParticipante: 0,
            },
        });

        const expositor3 = await prisma.usuario.create({
            data: {
                ci: '2468013579',
                nombre: 'Ing. Roberto Sánchez',
                primerNombre: 'Roberto',
                primerApellido: 'Sánchez',
                email: 'roberto.sanchez@cnc.gob.ec',
                telefono: '0966666666',
                password: hashedPassword,
                rolId: conferencistaRole.id,
                entidadId: cncEntity.id,
                tipoParticipante: 0,
            },
        });

        // USUARIOS PARTICIPANTES
        const user1 = await prisma.usuario.create({
            data: {
                ci: '1122334455',
                nombre: 'Juan Pérez García',
                primerNombre: 'Juan',
                segundoNombre: 'Carlos',
                primerApellido: 'Pérez',
                segundoApellido: 'García',
                email: 'juan.perez@quito.gob.ec',
                telefono: '0955555555',
                password: hashedPassword,
                rolId: usuarioRole.id,
                entidadId: gadQuito.id,
                tipoParticipante: 2,
                provinciaId: pichincha?.id,
                cantonId: quito?.id
            },
        });

        const user2 = await prisma.usuario.create({
            data: {
                ci: '5544332211',
                nombre: 'Ana Rodríguez Morales',
                primerNombre: 'Ana',
                segundoNombre: 'María',
                primerApellido: 'Rodríguez',
                segundoApellido: 'Morales',
                email: 'ana.rodriguez@quito.gob.ec',
                telefono: '0944444444',
                password: hashedPassword,
                rolId: usuarioRole.id,
                entidadId: gadQuito.id,
                tipoParticipante: 2,
                provinciaId: pichincha?.id,
                cantonId: quito?.id
            },
        });

        const user3 = await prisma.usuario.create({
            data: {
                ci: '6677889900',
                nombre: 'Pedro Gómez Vera',
                primerNombre: 'Pedro',
                segundoNombre: 'Luis',
                primerApellido: 'Gómez',
                segundoApellido: 'Vera',
                email: 'pedro.gomez@guayaquil.gob.ec',
                telefono: '0933333333',
                password: hashedPassword,
                rolId: usuarioRole.id,
                entidadId: gadGuayaquil.id,
                tipoParticipante: 2,
                provinciaId: guayas?.id,
                cantonId: guayaquil?.id
            },
        });

        const user4 = await prisma.usuario.create({
            data: {
                ci: '9988776655',
                nombre: 'Laura Martínez Silva',
                primerNombre: 'Laura',
                segundoNombre: 'Isabel',
                primerApellido: 'Martínez',
                segundoApellido: 'Silva',
                email: 'laura.martinez@guayaquil.gob.ec',
                telefono: '0922222222',
                password: hashedPassword,
                rolId: usuarioRole.id,
                entidadId: gadGuayaquil.id,
                tipoParticipante: 2,
                provinciaId: guayas?.id,
                cantonId: guayaquil?.id
            },
        });

        const user5 = await prisma.usuario.create({
            data: {
                ci: '1231231234',
                nombre: 'Diego Torres Ramírez',
                primerNombre: 'Diego',
                segundoNombre: 'Andrés',
                primerApellido: 'Torres',
                segundoApellido: 'Ramírez',
                email: 'diego.torres@cuenca.gob.ec',
                telefono: '0911111111',
                password: hashedPassword,
                rolId: usuarioRole.id,
                entidadId: gadCuenca.id,
                tipoParticipante: 2,
                provinciaId: azuay?.id,
                cantonId: cuenca?.id
            },
        });

        const user6 = await prisma.usuario.create({
            data: {
                ci: '3213213210',
                nombre: 'Carmen Flores Mendoza',
                primerNombre: 'Carmen',
                segundoNombre: 'Rosa',
                primerApellido: 'Flores',
                segundoApellido: 'Mendoza',
                email: 'carmen.flores@pichincha.gob.ec',
                telefono: '0900000000',
                password: hashedPassword,
                rolId: usuarioRole.id,
                entidadId: gadPichincha.id,
                tipoParticipante: 1, // Funcionario Provincial
                provinciaId: pichincha?.id,
            },
        });

        console.log('✅ Users created\n');

        // ============================================
        // STEP 6: CAPACITACIONES
        // ============================================
        console.log('📚 Creating capacitaciones...');

        const cap1 = await prisma.capacitacion.create({
            data: {
                nombre: 'Gestión de Competencias y Descentralización',
                descripcion: 'Curso integral sobre el marco legal y procesos de descentralización en el Ecuador. Incluye análisis de competencias exclusivas, concurrentes y residuales de los GADs.',
                fechaInicio: new Date('2026-03-15'),
                fechaFin: new Date('2026-03-17'),
                lugar: 'Auditorio CNC - Quito',
                cuposDisponibles: 50,
                modalidad: 'Presencial',
                estado: 'Activa',
            }
        });

        const cap2 = await prisma.capacitacion.create({
            data: {
                nombre: 'Planificación Territorial y Ordenamiento Urbano',
                descripcion: 'Taller práctico sobre herramientas de planificación territorial, uso de suelo y desarrollo urbano sostenible para GADs municipales.',
                fechaInicio: new Date('2026-03-20'),
                fechaFin: new Date('2026-03-22'),
                lugar: 'Plataforma Virtual Zoom',
                cuposDisponibles: 100,
                modalidad: 'Virtual',
                estado: 'Activa',
            }
        });

        const cap3 = await prisma.capacitacion.create({
            data: {
                nombre: 'Participación Ciudadana y Transparencia',
                descripcion: 'Seminario sobre mecanismos de participación ciudadana, rendición de cuentas y transparencia en la gestión pública local.',
                fechaInicio: new Date('2026-04-10'),
                fechaFin: new Date('2026-04-12'),
                lugar: 'Sala de Conferencias CNC / Virtual',
                cuposDisponibles: 75,
                modalidad: 'Hibrida',
                estado: 'Activa',
            }
        });

        const cap4 = await prisma.capacitacion.create({
            data: {
                nombre: 'Gestión Financiera para GADs',
                descripcion: 'Capacitación sobre presupuestos participativos, ejecución presupuestaria y control del gasto público en gobiernos autónomos descentralizados.',
                fechaInicio: new Date('2026-01-15'),
                fechaFin: new Date('2026-01-17'),
                lugar: 'Hotel Quito - Sala Principal',
                cuposDisponibles: 40,
                modalidad: 'Presencial',
                estado: 'Finalizada',
            }
        });

        const cap5 = await prisma.capacitacion.create({
            data: {
                nombre: 'Innovación y Gobierno Digital',
                descripcion: 'Curso sobre transformación digital, gobierno electrónico y servicios públicos digitales para mejorar la eficiencia administrativa.',
                fechaInicio: new Date('2026-05-05'),
                fechaFin: new Date('2026-05-07'),
                lugar: 'Google Meet',
                cuposDisponibles: 120,
                modalidad: 'Virtual',
                estado: 'Activa',
            }
        });

        console.log('✅ Capacitaciones created\n');

        // ============================================
        // STEP 7: ENROLLMENTS
        // ============================================
        console.log('📝 Creating enrollments...');
        await prisma.usuarioCapacitacion.createMany({
            data: [
                // Capacitación 1
                { usuarioId: user1.id, capacitacionId: cap1.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user2.id, capacitacionId: cap1.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user3.id, capacitacionId: cap1.id, estadoInscripcion: 'Activa', asistio: false },

                // Capacitación 2
                { usuarioId: user1.id, capacitacionId: cap2.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user4.id, capacitacionId: cap2.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user5.id, capacitacionId: cap2.id, estadoInscripcion: 'Activa', asistio: false },

                // Capacitación 3
                { usuarioId: user2.id, capacitacionId: cap3.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user3.id, capacitacionId: cap3.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user4.id, capacitacionId: cap3.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user6.id, capacitacionId: cap3.id, estadoInscripcion: 'Activa', asistio: false },

                // Capacitación 4 (Finalizada con asistencia)
                { usuarioId: user1.id, capacitacionId: cap4.id, estadoInscripcion: 'Finalizada', asistio: true },
                { usuarioId: user2.id, capacitacionId: cap4.id, estadoInscripcion: 'Finalizada', asistio: true },
                { usuarioId: user3.id, capacitacionId: cap4.id, estadoInscripcion: 'Finalizada', asistio: false },
                { usuarioId: user5.id, capacitacionId: cap4.id, estadoInscripcion: 'Finalizada', asistio: true },

                // Capacitación 5
                { usuarioId: user1.id, capacitacionId: cap5.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user2.id, capacitacionId: cap5.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user3.id, capacitacionId: cap5.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user4.id, capacitacionId: cap5.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user6.id, capacitacionId: cap5.id, estadoInscripcion: 'Activa', asistio: false },
            ],
        });

        console.log('✅ Enrollments created\n');

        // ============================================
        // STEP 8: PLANTILLAS DE CERTIFICADOS
        // ============================================
        console.log('📜 Creating certificate templates...');

        const plantilla1 = await prisma.plantilla.create({
            data: {
                nombre: 'Plantilla Estándar CNC 2026',
                imagenUrl: '/assets/plantillas/plantilla-estandar.png',
                configuracion: {
                    nombreUsuario: { x: 420, y: 300, fontSize: 32, color: '#1a1a1a' },
                    curso: { x: 420, y: 370, fontSize: 18, color: '#333333' },
                    fecha: { x: 420, y: 450, fontSize: 14, color: '#666666' },
                    horas: { x: 420, y: 480, fontSize: 14, color: '#666666' }
                },
                activa: true
            }
        });

        const plantilla2 = await prisma.plantilla.create({
            data: {
                nombre: 'Plantilla Formal Azul',
                imagenUrl: '/assets/plantillas/plantilla-azul.png',
                configuracion: {
                    nombreUsuario: { x: 400, y: 280, fontSize: 28, color: '#003366' },
                    curso: { x: 400, y: 350, fontSize: 16, color: '#004080' },
                    fecha: { x: 400, y: 420, fontSize: 12, color: '#0066cc' },
                    cedula: { x: 400, y: 450, fontSize: 12, color: '#0066cc' }
                },
                activa: false
            }
        });

        const plantilla3 = await prisma.plantilla.create({
            data: {
                nombre: 'Plantilla Moderna Verde',
                imagenUrl: '/assets/plantillas/plantilla-verde.png',
                configuracion: {
                    nombreUsuario: { x: 450, y: 320, fontSize: 30, color: '#2d5016' },
                    curso: { x: 450, y: 390, fontSize: 17, color: '#3d6b1f' },
                    fecha: { x: 450, y: 460, fontSize: 13, color: '#4d7c2f' },
                    rol: { x: 450, y: 490, fontSize: 13, color: '#4d7c2f' }
                },
                activa: false
            }
        });

        console.log('✅ Certificate templates created\n');

        // ============================================
        // STEP 9: CERTIFICATES
        // ============================================
        console.log('🏆 Creating certificates...');
        await prisma.certificado.createMany({
            data: [
                {
                    usuarioId: user1.id,
                    capacitacionId: cap4.id,
                    codigoQR: `CERT-CNC-${user1.id}-${cap4.id}-${Date.now()}`,
                    fechaEmision: new Date(),
                },
                {
                    usuarioId: user2.id,
                    capacitacionId: cap4.id,
                    codigoQR: `CERT-CNC-${user2.id}-${cap4.id}-${Date.now()}`,
                    fechaEmision: new Date(),
                },
                {
                    usuarioId: user5.id,
                    capacitacionId: cap4.id,
                    codigoQR: `CERT-CNC-${user5.id}-${cap4.id}-${Date.now()}`,
                    fechaEmision: new Date(),
                }
            ],
        });

        console.log('✅ Certificates created\n');

        // ============================================
        // SUMMARY
        // ============================================
        console.log('\n✅ ========================================');
        console.log('✅ SEED COMPLETED SUCCESSFULLY!');
        console.log('✅ ========================================\n');

        console.log('📊 DATABASE SUMMARY:');
        console.log('┌─────────────────────────────────────────┐');
        console.log('│ AUTHENTICATION & USERS                  │');
        console.log('├─────────────────────────────────────────┤');
        console.log('│ • 3 Roles                               │');
        console.log('│ • 5 Entidades                           │');
        console.log('│ • 10 Usuarios (1 admin, 3 expositores,  │');
        console.log('│   6 participantes)                      │');
        console.log('├─────────────────────────────────────────┤');
        console.log('│ GEOGRAPHIC DATA                         │');
        console.log('├─────────────────────────────────────────┤');
        console.log(`│ • ${totalProvincias} Provincias                  │`);
        console.log(`│ • ${totalCantones} Cantones                    │`);
        console.log(`│ • ${totalParroquias} Parroquias (Approx)         │`);
        console.log('├─────────────────────────────────────────┤');
        console.log('│ CATALOGS                                │');
        console.log('├─────────────────────────────────────────┤');
        console.log('│ • 10 Cargos                             │');
        console.log('│ • 8 Competencias                        │');
        console.log('│ • 5 Instituciones del Sistema           │');
        console.log('├─────────────────────────────────────────┤');
        console.log('│ CAPACITACIONES                          │');
        console.log('├─────────────────────────────────────────┤');
        console.log('│ • 5 Capacitaciones                      │');
        console.log('│ • 19 Inscripciones                      │');
        console.log('│ • 3 Plantillas de Certificados          │');
        console.log('│ • 3 Certificados                        │');
        console.log('└─────────────────────────────────────────┘\n');

        console.log('🔑 CREDENTIALS (Password: AdminPassword123!):');
        console.log('┌─────────────────────────────────────────┐');
        console.log('│ ADMINISTRADOR                           │');
        console.log('│ CI: 1234567890                          │');
        console.log('│ Email: admin@cnc.gob.ec                 │');
        console.log('├─────────────────────────────────────────┤');
        console.log('│ EXPOSITORES                             │');
        console.log('│ • Dr. Carlos Mendoza - 0987654321       │');
        console.log('│ • Dra. María López - 1357924680         │');
        console.log('│ • Ing. Roberto Sánchez - 2468013579     │');
        console.log('├─────────────────────────────────────────┤');
        console.log('│ PARTICIPANTES                           │');
        console.log('│ • Juan Pérez - 1122334455               │');
        console.log('│ • Ana Rodríguez - 5544332211            │');
        console.log('│ • Pedro Gómez - 6677889900              │');
        console.log('│ • Laura Martínez - 9988776655           │');
        console.log('│ • Diego Torres - 1231231234             │');
        console.log('│ • Carmen Flores - 3213213210            │');
        console.log('└─────────────────────────────────────────┘\n');

    } catch (error) {
        console.error('❌ Error during seed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
