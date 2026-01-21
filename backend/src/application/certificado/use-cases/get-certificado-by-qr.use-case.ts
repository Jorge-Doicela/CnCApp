import { injectable, inject } from 'tsyringe';
import { CertificadoRepository } from '../../../domain/certificado/repositories/certificado.repository';
import { Certificado } from '../../../domain/certificado/entities/certificado.entity';

@injectable()
export class GetCertificadoByQRUseCase {
    constructor(
        @inject('CertificadoRepository') private certificadoRepository: CertificadoRepository
    ) { }

    async execute(qr: string): Promise<Certificado | null> {
        return this.certificadoRepository.findByQR(qr);
    }
}
