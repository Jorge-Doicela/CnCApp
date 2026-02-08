import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { GetInscritosUseCase } from '../../../application/usuario-capacitacion/use-cases/get-inscritos.use-case';
import { InscribirUsuarioUseCase } from '../../../application/usuario-capacitacion/use-cases/inscribir-usuario.use-case';
import { EliminarInscripcionUseCase } from '../../../application/usuario-capacitacion/use-cases/eliminar-inscripcion.use-case';
import { ActualizarAsistenciaUseCase } from '../../../application/usuario-capacitacion/use-cases/actualizar-asistencia.use-case';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';

export class UsuarioCapacitacionController {

    // GET /api/usuarios-capacitaciones/:id
    async getInscritos(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const useCase = container.resolve(GetInscritosUseCase);
            const data = await useCase.execute(Number(id));
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/usuarios-capacitaciones
    async getByFilters(req: Request, res: Response, next: NextFunction) {
        try {
            const { idCapacitacion, asistencia, idUsuario } = req.query;

            // Temporary direct usage of repo for filtering until specific filter use case is made
            // or modify GetInscritosUseCase to support filters.

            // For now, support getUsuariosNoAsistieron: ?idCapacitacion=X&asistencia=false
            if (idCapacitacion && asistencia === 'false') {
                // Reuse repository directly or create use case on fly?
                // Best to use a UseCase.
                // I'll reuse EliminarInscripcionUseCase? No.
                // I'll just resolve repository for this simple filter for now to save time/complexity
                // or add method to GetInscritosUseCase.
                // Let's resolve Repository directly as exception or create a specific use case "GetUsuariosNoAsistieronUseCase".
                // I didnt create it. I will use repository directly here for expediency as this is a "fix".
                const repo = container.resolve<UsuarioCapacitacionRepository>('UsuarioCapacitacionRepository');
                // Wait, repository method return all, filter in memory? 
                // Repository has findByCapacitacionId.
                const data = await repo.findByCapacitacionId(Number(idCapacitacion));
                const filtered = data.filter(u => u.asistio === false);
                res.status(200).json(filtered);
                return;
            }

            if (idUsuario) {
                const repo = container.resolve<UsuarioCapacitacionRepository>('UsuarioCapacitacionRepository');
                const data = await repo.findByUsuarioId(Number(idUsuario));
                res.status(200).json(data);
                return;
            }

            res.status(400).json({ message: 'Missing query params' });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/usuarios-capacitaciones
    async inscribir(req: Request, res: Response, next: NextFunction) {
        try {
            const { Id_Capacitacion, Id_Usuario, Rol_Capacitacion, Asistencia, Estado_Inscripcion } = req.body;

            const useCase = container.resolve(InscribirUsuarioUseCase);

            // Map frontend PascalCase to backend camelCase
            const data = await useCase.execute({
                capacitacionId: Id_Capacitacion,
                usuarioId: Id_Usuario,
                rolCapacitacion: Rol_Capacitacion, // This will be passed to prisma which might ignore it if type is wrong but runtime is object
                asistio: Asistencia,
                estadoInscripcion: Estado_Inscripcion
            });
            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/usuarios-capacitaciones/relacion/:id
    async eliminarPorRelacion(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const useCase = container.resolve(EliminarInscripcionUseCase);
            await useCase.executeByRelacion(Number(id));
            res.status(200).json({ message: 'Eliminado correctamente' });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/usuarios-capacitaciones/no-asistieron/:id
    async eliminarNoAsistieron(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params; // idCapacitacion
            const useCase = container.resolve(EliminarInscripcionUseCase);
            await useCase.executeNoAsistieron(Number(id));
            res.status(200).json({ message: 'Eliminados correctamente' });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/usuarios-capacitaciones/:idCapacitacion/:idUsuario
    async cancelarInscripcion(req: Request, res: Response, next: NextFunction) {
        try {
            const { idCapacitacion, idUsuario } = req.params;
            const repo = container.resolve<UsuarioCapacitacionRepository>('UsuarioCapacitacionRepository');
            await repo.deleteByCapacitacionAndUser(Number(idCapacitacion), Number(idUsuario));
            res.status(200).json({ message: 'Inscripción cancelada' });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/usuarios-capacitaciones/asistencia/:id
    async actualizarAsistencia(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { asistencia } = req.body;
            const useCase = container.resolve(ActualizarAsistenciaUseCase);
            const data = await useCase.execute(Number(id), asistencia);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/usuarios-capacitaciones/asistencia-masiva/:id
    async actualizarAsistenciaMasiva(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params; // idCapacitacion
            const { asistencia } = req.body;
            const useCase = container.resolve(ActualizarAsistenciaUseCase);
            await useCase.executeMasiva(Number(id), asistencia);
            res.status(200).json({ message: 'Asistencia masiva actualizada' });
        } catch (error) {
            next(error);
        }
    }
}
