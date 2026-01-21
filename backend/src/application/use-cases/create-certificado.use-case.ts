import { injectable, inject } from 'tsyringe';
import { CertificadoRepository } from '../../domain/repositories/certificado.repository';
import { Certificado } from '../../domain/entities/certificado.entity';

@injectable()
export class CreateCertificadoUseCase {
    constructor(
        @inject('CertificadoRepository') private certificadoRepository: CertificadoRepository
    ) { }

    async execute(data: Partial<Certificado>): Promise<Certificado> {
        return this.certificadoRepository.create(data);
    }
}
