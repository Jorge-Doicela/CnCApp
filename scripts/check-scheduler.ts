
import 'reflect-metadata';
import '../../src/config/di.container';
import prisma from '../../src/config/database';
import { EstadoCapacitacionEnum } from '../../src/domain/shared/constants/enums';

async function check() {
    const ahora = new Date();
    console.log('Ahora (UTC):', ahora.toISOString());
    console.log('Ahora (Local):', ahora.toString());

    const capacitaciones = await prisma.capacitacion.findMany({
        where: {
            estado: { in: ['Activa', 'Pendiente'] }
        }
    });

    console.log(`Encontradas ${capacitaciones.length} capacitaciones activas/pendientes.`);

    for (const cap of capacitaciones) {
        console.log(`--- Cap: ${cap.nombre} (ID: ${cap.id}) ---`);
        console.log('  Estado:', cap.estado);
        console.log('  fechaFin:', cap.fechaFin ? cap.fechaFin.toISOString() : 'NULL');
        console.log('  horaFin:', cap.horaFin);
        
        if (cap.fechaFin) {
            const lte = cap.fechaFin <= ahora;
            console.log('  fechaFin <= ahora:', lte);
            
            // Simular buildFechaHoraFin
            const year = cap.fechaFin.getUTCFullYear();
            const month = String(cap.fechaFin.getUTCMonth() + 1).padStart(2, '0');
            const day = String(cap.fechaFin.getUTCDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            let horaStr = cap.horaFin || '23:59';
            if (!horaStr.includes(':')) horaStr = '23:59';

            const combinedStr = `${dateStr}T${horaStr}:00.000-05:00`;
            const fechaHoraFin = new Date(combinedStr);
            
            console.log('  fechaHoraFin (Calculada):', fechaHoraFin.toISOString());
            console.log('  fechaHoraFin > ahora:', fechaHoraFin > ahora);
        }
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
