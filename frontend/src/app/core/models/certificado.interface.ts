import { Usuario } from './usuario.interface';
import { Capacitacion } from './capacitacion.interface';

export interface Certificado {
    id: number;
    usuarioId: number;
    capacitacionId: number;
    codigoQR: string;
    fechaEmision: string;
    pdfUrl?: string;
    usuario?: Usuario;
    capacitacion?: Capacitacion;
}
