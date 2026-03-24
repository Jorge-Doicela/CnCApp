import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
    console.log('Starting certificate deduplication...');

    try {
        // Encontrar grupos de (usuarioId, capacitacionId) que tengan más de un certificado
        const duplicates = await prisma.$queryRaw`
            SELECT id_usuario, id_capacitacion, COUNT(*) 
            FROM certificados 
            GROUP BY id_usuario, id_capacitacion 
            HAVING COUNT(*) > 1
        ` as any[];

        console.log(`Found ${duplicates.length} user/training pairs with duplicates.`);

        for (const duplicate of duplicates) {
            const userId = duplicate.id_usuario;
            const trainingId = duplicate.id_capacitacion;

            // Obtener todos los certificados para este par, ordenados por fecha de emisión (más reciente primero)
            const allCerts = await prisma.certificado.findMany({
                where: {
                    usuarioId: userId,
                    capacitacionId: trainingId
                },
                orderBy: {
                    fechaEmision: 'desc'
                }
            });

            // Mantener el primero, borrar los demás
            const keepId = allCerts[0].id;
            const deleteIds = allCerts.slice(1).map(c => c.id);

            console.log(`Pair (${userId}, ${trainingId}): Keeping certificate ${keepId}, deleting ${deleteIds.length} duplicates.`);

            await prisma.certificado.deleteMany({
                where: {
                    id: { in: deleteIds }
                }
            });
        }

        console.log('Deduplication finished successfully.');
    } catch (error) {
        console.error('Error during deduplication:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupDuplicates();
