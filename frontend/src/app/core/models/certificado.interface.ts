export interface Certificado {
    Id_Certificado: number;
    Id_Usuario: number;
    Id_Capacitacion: number;
    Codigo_QR: string;
    Fecha_Emision: string;
    PDF_URL?: string;
    Fecha_generado?: string; // Frontend alias for date?
}
