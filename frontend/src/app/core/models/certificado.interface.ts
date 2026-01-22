export interface Certificado {
    id: number;
    usuarioId: number;
    capacitacionId: number;
    codigoQr: string;
    fechaEmision: string;
    pdfUrl?: string;
}
