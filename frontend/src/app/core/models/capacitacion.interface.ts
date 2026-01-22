export interface Capacitacion {
    Id_Capacitacion: number;
    Nombre_Capacitacion: string;
    Descripcion_Capacitacion?: string;
    Fecha_Inicio?: string; // Date string
    Fecha_Fin?: string; // Date string
    Fecha_Capacitacion?: string; // Legacy field used in frontend?
    Lugar_Capacitacion?: string;
    Cupos_Disponibles: number;
    Modalidades?: string; // Frontend uses this
    Estado: number; // Frontend treats as number (0: Pendiente, 1: Realizada)
    Hora_Inicio?: string;
    Hora_Fin?: string;
    Horas?: number;
    Limite_Participantes?: number;
    Enlace_Virtual?: string;
    Certificado?: boolean;
    entidades_encargadas?: number[]; // For form
    ids_usuarios?: number[]; // For form
    expositores?: number[]; // For form
    created_at?: string;
}

export interface UsuarioCapacitacion {
    Id_Inscripcion: number;
    Id_Usuario: number;
    Id_Capacitacion: number;
    Fecha_Inscripcion: string;
    Estado_Inscripcion: string;
    Asistencia: boolean;
    Rol_Capacitacion?: string;
}
