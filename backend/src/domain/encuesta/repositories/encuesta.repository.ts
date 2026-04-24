import { EncuestaSatisfaction, EncuestaRespuesta } from '@prisma/client';

export interface EncuestaRepository {
    createEncuesta(data: any): Promise<EncuestaSatisfaction>;
    getEncuestaById(id: number): Promise<EncuestaSatisfaction | null>;
    getEncuestaByCapacitacion(capacitacionId: number): Promise<EncuestaSatisfaction | null>;
    submitRespuesta(data: any): Promise<EncuestaRespuesta>;
    getResultados(encuestaId: number): Promise<EncuestaRespuesta[]>;
    hasUserResponded(encuestaId: number, usuarioId: number): Promise<boolean>;
}
