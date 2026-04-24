import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { SubmitEncuestaUseCase } from '../../../application/encuesta/use-cases/submit-encuesta.use-case';
import { EncuestaRepository } from '../../../domain/encuesta/repositories/encuesta.repository';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseIdParam } from '../middleware/parse-id.helper';

@injectable()
export class EncuestaController {
    constructor(
        @inject(SubmitEncuestaUseCase) private submitUseCase: SubmitEncuestaUseCase,
        @inject('EncuestaRepository') private encuestaRepository: EncuestaRepository
    ) {}

    getEncuestaByCapacitacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const encuesta = await this.encuestaRepository.getEncuestaByCapacitacion(id);
            if (!encuesta) {
                res.status(404).json({ message: 'No hay encuesta para esta capacitación' });
                return;
            }
            res.json(encuesta);
        } catch (error) {
            next(error);
        }
    };

    submitRespuesta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthRequest;
            const { encuestaId, ...rest } = req.body;
            
            const respuesta = await this.submitUseCase.execute({
                ...rest,
                encuestaId: Number(encuestaId),
                usuarioId: authReq.userId
            });
            
            res.status(201).json(respuesta);
        } catch (error) {
            next(error);
        }
    };

    getResultados = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const resultados = await this.encuestaRepository.getResultados(id);
            res.json(resultados);
        } catch (error) {
            next(error);
        }
    };

    checkIfResponded = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthRequest;
            const encuestaId = Number(req.params.id);
            const responded = await this.encuestaRepository.hasUserResponded(encuestaId, authReq.userId);
            res.json({ responded });
        } catch (error) {
            next(error);
        }
    };
}
