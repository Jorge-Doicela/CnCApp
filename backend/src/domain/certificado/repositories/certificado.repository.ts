import { Certificado } from '../entities/certificado.entity';

export interface CertificadoRepository {
    create(certificado: Partial<Certificado>): Promise<Certificado>;
    findById(id: number): Promise<Certificado | null>;
    findByQR(qr: string): Promise<Certificado | null>;
    findByUser(userId: number): Promise<Certificado[]>;
    findByUserAndCapacitacion(userId: number, capacitacionId: number): Promise<Certificado | null>;
    count(): Promise<number>;
}
