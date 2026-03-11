export interface Capacitacion {
    id: number;
    nombre: string;
    tipoEvento?: string | null;
    descripcion?: string | null;
    fechaInicio?: Date | null;
    fechaFin?: Date | null;
    lugar?: string | null;
    cuposDisponibles: number | null;
    modalidad?: string | null;
    estado: string | null;
    createdAt: Date;
    idsUsuarios?: number[];
    expositores?: number[];
    entidadesEncargadas?: number[];
    plantillaId?: number | null;
    horaInicio?: string | null;
    horaFin?: string | null;
    horas?: number | null;
    enlaceVirtual?: string | null;
    certificado?: boolean;
    codigoQrEvento?: string | null;
    plantilla?: any;
}
