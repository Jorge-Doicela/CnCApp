import { injectable } from 'tsyringe';
import prisma from '../../../../config/database';
import { Certificado } from '../../../../domain/certificado/entities/certificado.entity';
import { CertificadoRepository } from '../../../../domain/certificado/repositories/certificado.repository';
import { CertificadoMapper } from '../../../../domain/certificado/mappers/certificado.mapper';

@injectable()
export class PrismaCertificadoRepository implements CertificadoRepository {
    async create(data: Partial<Certificado>): Promise<Certificado> {
        const certificado = await prisma.certificado.create({
            data: {
                usuarioId: data.usuarioId!,
                capacitacionId: data.capacitacionId!,
                codigoQR: data.codigoQR!,
                fechaEmision: data.fechaEmision || new Date(),
                pdfUrl: data.pdfUrl
            }
        });
        return CertificadoMapper.toDomain(certificado);
    }

    async findById(id: number): Promise<Certificado | null> {
        const certificado = await prisma.certificado.findUnique({
            where: { id }
        });
        return certificado ? CertificadoMapper.toDomain(certificado) : null;
    }

    async findByQR(qr: string): Promise<Certificado | null> {
        const certificado = await prisma.certificado.findUnique({
            where: { codigoQR: qr },
            include: {
                usuario: {
                    include: {
                        rol: true,
                        entidad: true
                    }
                },
                capacitacion: true
            }
        });
        return certificado ? CertificadoMapper.toDomain(certificado) : null;
    }

    async findByUser(userId: number): Promise<Certificado[]> {
        const certificados = await prisma.certificado.findMany({
            where: { usuarioId: userId },
            include: {
                capacitacion: true
            },
            orderBy: { fechaEmision: 'desc' }
        });
        return certificados.map(c => CertificadoMapper.toDomain(c));
    }

    async findByUserAndCapacitacion(userId: number, capacitacionId: number): Promise<Certificado | null> {
        const certificado = await prisma.certificado.findFirst({
            where: {
                usuarioId: userId,
                capacitacionId: capacitacionId
            }
        });
        return certificado ? CertificadoMapper.toDomain(certificado) : null;
    }

    async count(): Promise<number> {
        return await prisma.certificado.count();
    }
}
