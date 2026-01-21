import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { CreateCertificadoUseCase } from '../../../application/use-cases/create-certificado.use-case';
import { GetCertificadoByQRUseCase } from '../../../application/use-cases/get-certificado-by-qr.use-case';
import { GetUserCertificadosUseCase } from '../../../application/use-cases/get-user-certificados.use-case';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const certificadoSchema = z.object({
    usuarioId: z.number().int(),
    capacitacionId: z.number().int(),
    codigoQR: z.string(),
    pdfUrl: z.string().optional()
});

@injectable()
export class CertificadoController {
    constructor(
        private createUseCase: CreateCertificadoUseCase,
        private getByQRUseCase: GetCertificadoByQRUseCase,
        private getByUserUseCase: GetUserCertificadosUseCase
    ) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = certificadoSchema.parse(req.body);
            const certificado = await this.createUseCase.execute(data);
            res.status(201).json(certificado);
        } catch (error) {
            next(error);
        }
    };

    getByQR = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const qr = req.params.qr as string;
            const certificado = await this.getByQRUseCase.execute(qr);
            if (!certificado) {
                res.status(404).json({ error: 'Certificado no encontrado' });
                return;
            }
            res.json(certificado);
        } catch (error) {
            next(error);
        }
    };

    getMyCertificados = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }
            const certificados = await this.getByUserUseCase.execute(req.userId);
            res.json(certificados);
        } catch (error) {
            next(error);
        }
    };
}
