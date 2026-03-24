export interface ConfiguracionCampo {
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontFamily?: string;
    width?: number;
    textAlign?: string;
    isUnderline?: boolean;
    textoTemplate?: string; // New: Supports placeholders like {{usuario}} and <b> tags
}

export interface FirmaConfig {
    id: string;
    nombrePersona: string;
    cargo: string;
    institucion?: string;
    imagenUrl: string; // The signature image
    x: number;
    y: number;
    width: number;
    height: number;
    isDynamic?: boolean;
}

export interface PlantillaCertificado {
    id: number;
    nombre: string;
    imagenUrl: string;
    configuracion: {
        nombreUsuario: ConfiguracionCampo;
        curso: ConfiguracionCampo;
        fecha: ConfiguracionCampo;
        cedula?: ConfiguracionCampo;
        rol?: ConfiguracionCampo;
        horas?: ConfiguracionCampo;
        parrafo?: ConfiguracionCampo;
        codigoQR?: ConfiguracionCampo;
        firmas?: FirmaConfig[]; // JSON slot for persistence
        [key: string]: any;
    };
    firmas: FirmaConfig[]; // Transient field for component logic
    activa: boolean;
    createdAt?: string;
    updatedAt?: string;
}
