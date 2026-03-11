export interface Capacitacion {
    id: number;
    nombre: string;
    descripcion?: string;
    fechaInicio?: string | Date;
    fechaFin?: string | Date;
    lugar?: string;
    cuposDisponibles: number;
    modalidad?: string;
    estado: string; // 'Activa', 'Pendiente', 'Realizada', 'Cancelada'
    horaInicio?: string;
    horaFin?: string;
    horas?: number;
    enlaceVirtual?: string;
    latitud?: number;
    longitud?: number;
    certificado?: boolean;
    codigoQrEvento?: string; // UUID único por evento, usada para QR de asistencia
    entidadesEncargadas?: number[]; // For form
    idsUsuarios?: number[]; // For form
    expositores?: number[]; // For form
    createdAt?: string;
    inscripciones?: UsuarioCapacitacion[];
}

export interface UsuarioCapacitacion {
    id: number;
    usuarioId: number;
    capacitacionId: number;
    fechaInscripcion: string;
    estadoInscripcion: string;
    asistio: boolean;
    // Rol_Capacitacion might be distinct if strictly mapped
    rolCapacitacion?: string;
}
