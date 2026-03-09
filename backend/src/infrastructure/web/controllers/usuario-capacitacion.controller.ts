import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetInscritosUseCase } from '../../../application/usuario-capacitacion/use-cases/get-inscritos.use-case';
import { InscribirUsuarioUseCase } from '../../../application/usuario-capacitacion/use-cases/inscribir-usuario.use-case';
import { EliminarInscripcionUseCase } from '../../../application/usuario-capacitacion/use-cases/eliminar-inscripcion.use-case';
import { ActualizarAsistenciaUseCase } from '../../../application/usuario-capacitacion/use-cases/actualizar-asistencia.use-case';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';
import { AuthRequest } from '../middleware/auth.middleware';
import { ROLES } from '../../../domain/shared/constants/roles.constants';

@injectable()
export class UsuarioCapacitacionController {
    constructor(
        @inject(GetInscritosUseCase) private getInscritosUseCase: GetInscritosUseCase,
        @inject(InscribirUsuarioUseCase) private inscribirUsuarioUseCase: InscribirUsuarioUseCase,
        @inject(EliminarInscripcionUseCase) private eliminarInscripcionUseCase: EliminarInscripcionUseCase,
        @inject(ActualizarAsistenciaUseCase) private actualizarAsistenciaUseCase: ActualizarAsistenciaUseCase,
        @inject('UsuarioCapacitacionRepository') private usuarioCapacitacionRepository: UsuarioCapacitacionRepository
    ) { }

    // GET /api/usuarios-capacitaciones/:id
    getInscritos = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const data = await this.getInscritosUseCase.execute(Number(id));
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    // GET /api/usuarios-capacitaciones
    getByFilters = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { idCapacitacion, asistencia, idUsuario } = req.query;

            // For now, support getUsuariosNoAsistieron: ?idCapacitacion=X&asistencia=false
            if (idCapacitacion && asistencia === 'false') {
                const data = await this.usuarioCapacitacionRepository.findByCapacitacionId(Number(idCapacitacion));
                const filtered = data.filter(u => u.asistio === false);
                res.status(200).json(filtered);
                return;
            }

            if (idUsuario) {
                const data = await this.usuarioCapacitacionRepository.findByUsuarioId(Number(idUsuario));
                res.status(200).json(data);
                return;
            }

            res.status(400).json({ message: 'Missing query params' });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/usuarios-capacitaciones/usuario/:idUsuario
    getByUsuarioId = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { idUsuario } = req.params;
            const targetUserId = Number(idUsuario);

            // Security check: Only owner or STAFF can view history
            const isStaff = req.userRoleName === ROLES.ADMINISTRADOR || req.userRoleName === ROLES.CONFERENCISTA;
            if (!isStaff && req.userId !== targetUserId) {
                res.status(403).json({ message: 'No tienes permiso para ver el historial de otro usuario' });
                return;
            }

            if (!idUsuario) {
                res.status(400).json({ message: 'Missing idUsuario param' });
                return;
            }
            const data = await this.usuarioCapacitacionRepository.findByUsuarioId(targetUserId);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    // POST /api/usuarios-capacitaciones
    inscribir = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { 
                Id_Capacitacion, Id_Usuario, Rol_Capacitacion, Asistencia, Estado_Inscripcion,
                capacitacionId, usuarioId, rolCapacitacion, asistio, estadoInscripcion 
            } = req.body;

            // Support both PascalCase (legacy) and camelCase
            const finalCapacitacionId = capacitacionId || Id_Capacitacion;
            const finalUsuarioId = usuarioId || Id_Usuario;

            // Security check: A user can only enroll themselves, unless they are STAFF
            const isStaff = req.userRoleName === ROLES.ADMINISTRADOR || req.userRoleName === ROLES.CONFERENCISTA;
            if (!isStaff && req.userId !== Number(finalUsuarioId)) {
                res.status(403).json({ message: 'No puedes inscribir a otro usuario' });
                return;
            }

            const data = await this.inscribirUsuarioUseCase.execute({
                capacitacionId: finalCapacitacionId,
                usuarioId: finalUsuarioId,
                rolCapacitacion: rolCapacitacion || Rol_Capacitacion,
                asistio: asistio !== undefined ? asistio : Asistencia,
                estadoInscripcion: estadoInscripcion || Estado_Inscripcion
            });
            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    };

    // DELETE /api/usuarios-capacitaciones/relacion/:id
    eliminarPorRelacion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await this.eliminarInscripcionUseCase.executeByRelacion(Number(id));
            res.status(200).json({ message: 'Eliminado correctamente' });
        } catch (error) {
            next(error);
        }
    };

    // DELETE /api/usuarios-capacitaciones/no-asistieron/:id
    eliminarNoAsistieron = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params; // idCapacitacion
            await this.eliminarInscripcionUseCase.executeNoAsistieron(Number(id));
            res.status(200).json({ message: 'Eliminados correctamente' });
        } catch (error) {
            next(error);
        }
    };

    // DELETE /api/usuarios-capacitaciones/:idCapacitacion/:idUsuario
    cancelarInscripcion = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { idCapacitacion, idUsuario } = req.params;
            const targetUserId = Number(idUsuario);

            // Security check: Only owner or STAFF can cancel enrollment
            const isStaff = req.userRoleName === ROLES.ADMINISTRADOR || req.userRoleName === ROLES.CONFERENCISTA;
            if (!isStaff && req.userId !== targetUserId) {
                res.status(403).json({ message: 'No puedes cancelar la inscripción de otro usuario' });
                return;
            }

            await this.usuarioCapacitacionRepository.deleteByCapacitacionAndUser(Number(idCapacitacion), targetUserId);
            res.status(200).json({ message: 'Inscripción cancelada' });
        } catch (error) {
            next(error);
        }
    };

    // PUT /api/usuarios-capacitaciones/asistencia/:id
    actualizarAsistencia = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { asistencia } = req.body;
            const data = await this.actualizarAsistenciaUseCase.execute(Number(id), asistencia);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    // PUT /api/usuarios-capacitaciones/asistencia-masiva/:id
    actualizarAsistenciaMasiva = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params; // idCapacitacion
            const { asistencia } = req.body;
            await this.actualizarAsistenciaUseCase.executeMasiva(Number(id), asistencia);
            res.status(200).json({ message: 'Asistencia masiva actualizada' });
        } catch (error) {
            next(error);
        }
    };
}
