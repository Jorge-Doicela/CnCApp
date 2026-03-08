import { Certificado } from '../entities/certificado.entity';
import { UserMapper } from '../../user/mappers/user.mapper';
import { CapacitacionMapper } from '../../capacitacion/mappers/capacitacion.mapper';

export class CertificadoMapper {
    static toDomain(prismaCertificado: any): Certificado {
        return {
            id: prismaCertificado.id,
            usuarioId: prismaCertificado.usuarioId,
            capacitacionId: prismaCertificado.capacitacionId,
            codigoQR: prismaCertificado.codigoQR,
            fechaEmision: prismaCertificado.fechaEmision,
            pdfUrl: prismaCertificado.pdfUrl,
            usuario: (prismaCertificado as any).usuario ? UserMapper.toDomain((prismaCertificado as any).usuario) : undefined,
            capacitacion: (prismaCertificado as any).capacitacion ? CapacitacionMapper.toDomain((prismaCertificado as any).capacitacion) : undefined
        };
    }
}
