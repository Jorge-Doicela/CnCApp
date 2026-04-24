import prisma from '../../config/database';
import bcrypt from 'bcrypt';
import logger from '../../config/logger';

/**
 * Ensures the system has the minimum data to function (Roles and Admin)
 * regardless of whether the seed was run.
 */
export async function bootstrapSystem(): Promise<void> {
    try {
        logger.info('[Bootstrap] Starting system verification...');

        // 1. Verify/Create Admin Role
        const adminRole = await prisma.rol.upsert({
            where: { codigo: 'ADMIN' },
            update: {},
            create: {
                nombre: 'Administrador',
                codigo: 'ADMIN',
                descripcion: 'Control total de la plataforma',
                modulos: [
                    'Ver Perfil', 'Ver conferencias', 'Gestionar roles', 'Gestionar capacitaciones',
                    'Gestionar usuarios', 'Gestionar entidades', 'Gestionar provincias',
                    'Gestionar parroquias', 'Gestionar cantones', 'Gestionar competencias',
                    'Gestionar instituciones', 'Gestionar plantillas', 'Gestionar reportes',
                    'Gestionar grados ocupacionales', 'Gestionar cargos', 'Validar certificados'
                ]
            }
        });

        // 2. Verify/Create Root Administrator
        const adminEmail = 'admin@cnc.gob.ec';
        const existingAdmin = await prisma.usuario.findUnique({
            where: { email: adminEmail }
        });

        if (!existingAdmin) {
            logger.info(`[Bootstrap] Creating root administrator: ${adminEmail}`);
            const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
            
            await prisma.usuario.create({
                data: {
                    nombre: 'ADMINISTRADOR DEL SISTEMA',
                    primerNombre: 'ADMINISTRADOR',
                    primerApellido: 'SISTEMA',
                    ci: '1700000000',
                    email: adminEmail,
                    password: hashedPassword,
                    rolId: adminRole.id,
                    estado: 1, // ACTIVO
                    authUid: 'admin-root'
                }
            });
            logger.info('[Bootstrap] Root administrator created successfully.');
        } else {
            logger.info('[Bootstrap] Root administrator already exists.');
        }

        logger.info('[Bootstrap] System verification completed.');
    } catch (error) {
        logger.error('[Bootstrap] Error during system verification:', error);
    }
}
