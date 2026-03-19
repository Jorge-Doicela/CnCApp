export interface ConfiguracionCampo {
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontFamily?: string;
    width?: number;
    textAlign?: string;
    isUnderline?: boolean;
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
        [key: string]: ConfiguracionCampo | undefined;
    };
    activa: boolean;
    createdAt?: string;
    updatedAt?: string;
}
