import { User } from '../../user/entities/user.entity';
import { Capacitacion } from '../../capacitacion/entities/capacitacion.entity';

export interface Certificado {
    id: number;
    usuarioId: number;
    capacitacionId: number;
    codigoQR: string;
    fechaEmision: Date;
    pdfUrl?: string | null;
    usuario?: User;
    capacitacion?: Capacitacion;
}
