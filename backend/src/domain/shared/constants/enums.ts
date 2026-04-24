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
    ADMINISTRADOR = 7,
    CONFERENCISTA = 8,
    USUARIO = 9
}

/**
 * Tipos de Participante (IDs)
 */
export enum TipoParticipanteIdEnum {
    AUTORIDAD = 9,
    CIUDADANO = 10,
    FUNCIONARIO_GAD = 11,
    INSTITUCION = 12
}
