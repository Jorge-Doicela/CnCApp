export interface Certificado {
    id: number;
    usuarioId: number;
    capacitacionId: number;
    codigoQR: string;
    fechaEmision: Date;
    pdfUrl?: string | null;
}
