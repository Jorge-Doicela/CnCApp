
/**
 * Tipos de Participante (Alineados con la Base de Datos)
 */
export enum TipoParticipanteEnum {
    AUTORIDAD = 9,
    CIUDADANO = 10,
    FUNCIONARIO_GAD = 11,
    INSTITUCION = 12
}

/**
 * Niveles de Gobierno (IDs en Base de Datos - Tabla Entidad)
 */
export enum NivelGobiernoEnum {
    PROVINCIAL = 25,
    MUNICIPAL = 26,
    PARROQUIAL = 27,
    GREMIOS = 28,
    CENTRAL = 29,
    COOPERANTES = 30,
    ACADEMIA = 31,
    EDUCACION = 32,
    PRIVADO = 33,
    CIUDADANIA = 34,
    MANCOMUNIDADES = 35,
    REGIMEN_ESPECIAL = 36
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
    ADMINISTRADOR = 7,
    CONFERENCISTA = 8,
    USUARIO = 9
}
