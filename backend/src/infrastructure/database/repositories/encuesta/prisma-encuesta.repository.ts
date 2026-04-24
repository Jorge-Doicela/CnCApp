import { injectable, inject } from 'tsyringe';
import { PrismaClient, EncuestaSatisfaction, EncuestaRespuesta } from '@prisma/client';
import { EncuestaRepository } from '../../../../domain/encuesta/repositories/encuesta.repository';

@injectable()
export class PrismaEncuestaRepository implements EncuestaRepository {
    constructor(
        @inject('PrismaClient') private prisma: PrismaClient
    ) {}

    async createEncuesta(data: any): Promise<EncuestaSatisfaction> {
        return this.prisma.encuestaSatisfaction.create({
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                capacitacionId: data.capacitacionId
            }
        });
    }

    async getEncuestaById(id: number): Promise<EncuestaSatisfaction | null> {
        return this.prisma.encuestaSatisfaction.findUnique({
            where: { id }
        });
    }

    async getEncuestaByCapacitacion(capacitacionId: number): Promise<EncuestaSatisfaction | null> {
        return this.prisma.encuestaSatisfaction.findFirst({
            where: { capacitacionId }
        });
    }

    async submitRespuesta(data: any): Promise<EncuestaRespuesta> {
        return this.prisma.encuestaRespuesta.create({
            data: {
                encuestaId: data.encuestaId,
                usuarioId: data.usuarioId,
                nivelGobierno: data.nivelGobierno,
                satisfaccionObjetivo: data.satisfaccionObjetivo,
                satisfaccionMetodologia: data.satisfaccionMetodologia,
                satisfaccionUtilidad: data.satisfaccionUtilidad,
                satisfaccionConocimiento: data.satisfaccionConocimiento,
                satisfaccionTiempo: data.satisfaccionTiempo,
                probabilidadAplicacion: data.probabilidadAplicacion,
                probabilidadFacilitacion: data.probabilidadFacilitacion,
                causaLimitacion: data.causaLimitacion,
                recomendaciones: data.recomendaciones,
                temasInteres: data.temasInteres
            }
        });
    }

    async getResultados(encuestaId: number): Promise<EncuestaRespuesta[]> {
        return this.prisma.encuestaRespuesta.findMany({
            where: { encuestaId },
            include: { usuario: true }
        });
    }

    async hasUserResponded(encuestaId: number, usuarioId: number): Promise<boolean> {
        const count = await this.prisma.encuestaRespuesta.count({
            where: { encuestaId, usuarioId }
        });
        return count > 0;
    }
}
