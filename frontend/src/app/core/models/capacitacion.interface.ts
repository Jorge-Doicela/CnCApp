export interface Capacitacion {
    id: number;
    nombre: string;
    descripcion?: string;
    fechaInicio?: string | Date;
    fechaFin?: string | Date;
    lugar?: string;
    cuposDisponibles: number;
    modalidad?: string;
    estado: string; // Backend returns string ("Activa", "Finalizada")? UseCase says string in Schema
    horaInicio?: string;
    horaFin?: string;
    horas?: number;
    limiteParticipantes?: number;
    enlaceVirtual?: string;
    certificado?: boolean;
    entidadesEncargadas?: number[]; // For form
    idsUsuarios?: number[]; // For form
    expositores?: number[]; // For form
    createdAt?: string;
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
