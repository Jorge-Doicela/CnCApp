
/**
 * Tipos de Participante (Alineados con la Base de Datos)
 */
export enum TipoParticipanteEnum {
    AUTORIDAD = 13,
    CIUDADANO = 14,
    FUNCIONARIO_GAD = 15,
    INSTITUCION = 16
}

/**
 * Estados de una Capacitación
 */
export enum EstadoCapacitacionEnum {
    PENDIENTE = 'Activa',
    REALIZADA = 'Finalizada',
    CANCELADA = 'Cancelada'
}

/**
 * Modalidades de Capacitación
 */
export enum ModalidadCapacitacionEnum {
    VIRTUAL = 'VIRTUAL',
    PRESENCIAL = 'PRESENCIAL',
    HIBRIDA = 'PRESENCIAL Y VIRTUAL'
}

/**
 * Roles dentro de una Capacitación
 */
export enum RolCapacitacionEnum {
    EXPOSITOR = 'Expositor',
    PARTICIPANTE = 'Participante'
}

/**
 * Roles de Usuario en el Sistema
 */
export enum RolEnum {
    ADMINISTRADOR = 11,
    USUARIO = 12
}
