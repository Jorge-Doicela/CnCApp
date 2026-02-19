import { injectable, inject } from 'tsyringe';
import { CertificadoRepository } from '../../../domain/certificado/repositories/certificado.repository';

@injectable()
export class CountCertificadosUseCase {
    constructor(
        @inject('CertificadoRepository') private certificadoRepository: CertificadoRepository
    ) { }

    async execute(): Promise<number> {
        return this.certificadoRepository.count();
    }
}
