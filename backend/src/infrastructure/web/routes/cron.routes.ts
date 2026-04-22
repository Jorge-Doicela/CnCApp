import { Router } from 'express';
import { container } from 'tsyringe';
import { UpdateCapacitacionUseCase } from '@application/capacitacion/use-cases/update-capacitacion.use-case';
import logger from '@config/logger';
import { EstadoCapacitacionEnum } from '@shared/constants/enums';
import prisma from '@config/database';

const router = Router();

/**
 * Endpoint para disparar el procesamiento de capacitaciones vencidas.
 * Puede ser llamado por Vercel Cron Jobs.
 */
router.get('/process-trainings', async (req, res) => {
    // Opcional: Verificar un token de seguridad en el header
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const ahora = new Date();
        const capacitaciones = await prisma.capacitacion.findMany({
            where: {
                estado: { 
                    notIn: [EstadoCapacitacionEnum.REALIZADA, EstadoCapacitacionEnum.CANCELADA, 'Finalizada', 'Realizada', 'Cancelada'] 
                }
            }
        });

        if (capacitaciones.length === 0) {
            return res.status(200).json({ message: 'No trainings to process' });
        }

        const updateUseCase = container.resolve(UpdateCapacitacionUseCase);
        let processed = 0;

        for (const cap of capacitaciones) {
            const baseDate = cap.fechaFin || cap.fechaInicio;
            if (!baseDate) continue;

            // Función buildFechaHoraFin simplificada aquí o importada
            const year = baseDate.getUTCFullYear();
            const month = String(baseDate.getUTCMonth() + 1).padStart(2, '0');
            const day = String(baseDate.getUTCDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            let horaStr = cap.horaFin || '23:59';
            const combinedStr = `${dateStr}T${horaStr}:00.000-05:00`;
            const fechaHoraFin = new Date(combinedStr);

            if (fechaHoraFin <= ahora) {
                await updateUseCase.execute(cap.id, { estado: EstadoCapacitacionEnum.REALIZADA });
                processed++;
            }
        }

        return res.status(200).json({ message: `Processed ${processed} trainings` });
    } catch (err: any) {
        logger.error(`[Cron] Error processing trainings: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
