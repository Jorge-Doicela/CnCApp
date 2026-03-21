
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
    PROVINCIAL = 1,
    MUNICIPAL = 2,
    PARROQUIAL = 3,
    GREMIOS = 4,
    CENTRAL = 5,
    OTRAS = 6,
    COOPERANTES = 7,
    ACADEMIA = 8,
    EDUCACION = 9,
    PRIVADO = 10,
    CIUDADANIA = 11,
    MANCOMUNIDADES = 12,
    REGIMEN_ESPECIAL = 13
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
