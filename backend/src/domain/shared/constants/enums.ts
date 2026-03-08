/**
 * Estados de una Capacitación
 */
export enum EstadoCapacitacionEnum {
    PENDIENTE = 'Activa',
    REALIZADA = 'Finalizada',
    CANCELADA = 'Cancelada'
}

/**
 * Roles dentro de una Capacitación (Inscripción)
 */
export enum RolCapacitacionEnum {
    EXPOSITOR = 'Expositor',
    PARTICIPANTE = 'Participante'
}

/**
 * Roles de Usuario en el Sistema (IDs)
 */
export enum RoleIdEnum {
    ADMINISTRADOR = 11,
    USUARIO = 12
}

/**
 * Tipos de Participante (IDs)
 */
export enum TipoParticipanteIdEnum {
    AUTORIDAD = 13,
    CIUDADANO = 14,
    FUNCIONARIO_GAD = 15,
    INSTITUCION = 16
}
