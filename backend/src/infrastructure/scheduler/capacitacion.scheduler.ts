import cron from 'node-cron';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import { GenerateAllCertificadosUseCase } from '../../application/certificado/use-cases/generate-all-certificados.use-case';
import logger from '../../config/logger';
import { EstadoCapacitacionEnum } from '../../domain/shared/constants/enums';

const prisma = new PrismaClient();

/**
 * Construye un objeto Date combinando la fecha (Date) y la hora ("HH:MM" string).
 * Si no hay hora, asume el final del día (23:59).
 */
function buildFechaHoraFin(fecha: Date, hora?: string | null): Date {
    const dt = new Date(fecha);
    if (hora) {
        const [h, m] = hora.split(':').map(Number);
        dt.setHours(h ?? 23, m ?? 59, 0, 0);
    } else {
        dt.setHours(23, 59, 0, 0);
    }
    return dt;
}

/**
 * Procesa las capacitaciones que debieron finalizar:
 * 1. Cambia estado a "Realizada"
 * 2. Genera certificados automáticamente para todos los asistentes
 * 3. Marca la capacitación como certificado=true
 */
async function procesarCapacitacionesVencidas(): Promise<void> {
    const ahora = new Date();

    // Buscar todas las capacitaciones activas/pendientes con fecha de fin en el pasado
    const capacitaciones = await prisma.capacitacion.findMany({
        where: {
            estado: { in: ['Activa', 'Pendiente'] },
            fechaFin: { lte: ahora } 
        }
    });

    if (capacitaciones.length === 0) return;

    logger.info(`[Scheduler] Revisando ${capacitaciones.length} capacitación(es) candidatas a finalizar...`);

    const generateAllUseCase = container.resolve(GenerateAllCertificadosUseCase);

    for (const cap of capacitaciones) {
        // Validar con hora exacta si el campo horaFin existe
        const fechaHoraFin = buildFechaHoraFin(cap.fechaFin!, cap.horaFin);

        if (fechaHoraFin > ahora) {
            // La hora de fin aún no llegó hoy
            continue;
        }

        logger.info(`[Scheduler] Finalizando capacitación ID=${cap.id} "${cap.nombre}" (fin: ${fechaHoraFin.toISOString()})`);

        try {
            // PASO 1: Marcar como Realizada (usando el Enum oficial 'Finalizada')
            await prisma.capacitacion.update({
                where: { id: cap.id },
                data: { estado: EstadoCapacitacionEnum.REALIZADA }
            });

            // PASO 2: Verificar si ya tiene certificados emitidos
            if (cap.certificado) {
                logger.info(`[Scheduler] Cap. ID=${cap.id} ya tiene certificados. Solo se actualizó estado.`);
                continue;
            }

            // Verificar si hay asistentes confirmados
            const asistentesCount = await prisma.usuarioCapacitacion.count({
                where: { capacitacionId: cap.id, asistio: true }
            });

            if (asistentesCount === 0) {
                logger.warn(`[Scheduler] Cap. ID=${cap.id} no tiene asistentes confirmados. No se emiten certificados.`);
                continue;
            }

            // PASO 3: Generar certificados para todos los asistentes
            logger.info(`[Scheduler] Cap. ID=${cap.id} — generando ${asistentesCount} certificado(s)...`);
            await generateAllUseCase.execute(cap.id);

            // PASO 4: Marcar certificado=true en la capacitación
            await prisma.capacitacion.update({
                where: { id: cap.id },
                data: { certificado: true }
            });

            logger.info(`[Scheduler] ✓ Cap. ID=${cap.id} finalizada y ${asistentesCount} certificado(s) emitido(s).`);

        } catch (err) {
            logger.error(`[Scheduler] Error procesando cap. ID=${cap.id}: ${err}`);
            // Continuar con lo demás — no detener el proceso
        }
    }
}

/**
 * Inicializa el cron job de finalización automática.
 * Corre cada 15 minutos para no perder eventos por pocas horas.
 */
export function initCapacitacionScheduler(): void {
    // Ejecutar inmediatamente al iniciar (para recuperar vencimientos ocurridos mientras el servidor estaba apagado)
    procesarCapacitacionesVencidas().catch(err =>
        logger.error(`[Scheduler] Error en ejecución inicial: ${err}`)
    );

    // Correr cada 15 minutos: "*/15 * * * *"
    cron.schedule('*/15 * * * *', async () => {
        try {
            await procesarCapacitacionesVencidas();
        } catch (err) {
            logger.error(`[Scheduler] Error en cron de finalización: ${err}`);
        }
    }, {
        timezone: 'America/Guayaquil' // Zona horaria de Ecuador
    });

    logger.info('[Scheduler] Cron de finalización automática de capacitaciones iniciado (cada 15 min, zona: America/Guayaquil)');
}
