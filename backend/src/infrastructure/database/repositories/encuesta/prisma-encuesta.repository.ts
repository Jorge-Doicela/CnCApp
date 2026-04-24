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
        let encuesta = await this.prisma.encuestaSatisfaction.findFirst({
            where: { capacitacionId }
        });

        if (!encuesta) {
            // Si no existe, crear una por defecto para esta capacitación
            const capacitacion = await this.prisma.capacitacion.findUnique({
                where: { id: capacitacionId }
            });

            if (!capacitacion) return null;

            encuesta = await this.prisma.encuestaSatisfaction.create({
                data: {
                    capacitacionId: capacitacionId,
                    titulo: `Encuesta de satisfacción: ${capacitacion.nombre}`,
                    descripcion: 'El objetivo de ésta encuesta es conocer su opinión sobre el servicio recibido para así mejorar los procesos de fortalecimiento institucional que ejecuta el CNC. La información proporcionada es confidencial y tiene el único objetivo de mejorar nuestra gestión. El CNC será responsable del tratamiento de los datos personales que el usuario proporcione y le informa que se gestionarán de conformidad con lo dispuesto en la Ley Orgánica de Protección de Datos Personales y su Reglamento.'
                }
            });
        }

        return encuesta;
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
