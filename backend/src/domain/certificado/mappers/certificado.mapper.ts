import { Certificado as PrismaCertificado } from '@prisma/client';
import { Certificado } from '../entities/certificado.entity';

export class CertificadoMapper {
    static toDomain(prismaCertificado: PrismaCertificado): Certificado {
        return {
            id: prismaCertificado.id,
            usuarioId: prismaCertificado.usuarioId,
            capacitacionId: prismaCertificado.capacitacionId,
            codigoQR: prismaCertificado.codigoQR,
            fechaEmision: prismaCertificado.fechaEmision,
            pdfUrl: prismaCertificado.pdfUrl
        };
    }
}
