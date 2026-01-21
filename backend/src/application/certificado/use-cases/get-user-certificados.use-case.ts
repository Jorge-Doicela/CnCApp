import { injectable, inject } from 'tsyringe';
import { CertificadoRepository } from '../../../domain/certificado/repositories/certificado.repository';
import { Certificado } from '../../../domain/certificado/entities/certificado.entity';

@injectable()
export class GetUserCertificadosUseCase {
    constructor(
        @inject('CertificadoRepository') private certificadoRepository: CertificadoRepository
    ) { }

    async execute(userId: number): Promise<Certificado[]> {
        return this.certificadoRepository.findByUser(userId);
    }
}
