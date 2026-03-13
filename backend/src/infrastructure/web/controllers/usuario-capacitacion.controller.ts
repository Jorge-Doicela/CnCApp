import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetInscritosUseCase } from '../../../application/usuario-capacitacion/use-cases/get-inscritos.use-case';
import { InscribirUsuarioUseCase } from '../../../application/usuario-capacitacion/use-cases/inscribir-usuario.use-case';
import { EliminarInscripcionUseCase } from '../../../application/usuario-capacitacion/use-cases/eliminar-inscripcion.use-case';
import { ActualizarAsistenciaUseCase } from '../../../application/usuario-capacitacion/use-cases/actualizar-asistencia.use-case';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';
import { AuthRequest } from '../middleware/auth.middleware';
import { ROLES } from '../../../domain/shared/constants/roles.constants';
import { EstadoCapacitacionEnum } from '../../../domain/shared/constants/enums';
import prisma from '../../../config/database';

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

            const finalCapacitacionId = capacitacionId || Id_Capacitacion;
            const finalUsuarioId = usuarioId || Id_Usuario;

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
            const { id } = req.params;
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
            const { id } = req.params;
            const { asistencia } = req.body;
            await this.actualizarAsistenciaUseCase.executeMasiva(Number(id), asistencia);
            res.status(200).json({ message: 'Asistencia masiva actualizada' });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/usuarios-capacitaciones/confirmar-asistencia-qr
     * El usuario escanea el QR del evento y confirma su propia asistencia.
     * Acepta tanto el UUID completo (QR escaneado) como el código corto de 8 chars (escrito manualmente).
     * Requiere autenticación.
     */
    confirmarAsistenciaQR = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { codigoQrEvento } = req.body;
            const userId = req.userId;

            if (!codigoQrEvento) {
                res.status(400).json({ message: 'El código del evento es requerido' });
                return;
            }

            if (!userId) {
                res.status(401).json({ message: 'Usuario no autenticado' });
                return;
            }

            const codigoLimpio = (codigoQrEvento as string).trim().toLowerCase();

            // 1. Buscar capacitación:
            //    - Si tiene 36 chars → UUID completo (desde QR escaneado)
            //    - Si tiene ≤ 8 chars → código corto → buscar por prefijo
            let capacitacion;

            if (codigoLimpio.length === 36) {
                // UUID completo — búsqueda exacta
                capacitacion = await prisma.capacitacion.findUnique({
                    where: { codigoQrEvento: codigoLimpio }
                });
            } else {
                // Código corto (los primeros N chars del UUID sin guiones)
                const sinGuiones = codigoLimpio.replace(/-/g, '');
                const capacitaciones = await prisma.capacitacion.findMany({
                    where: {
                        codigoQrEvento: {
                            startsWith: sinGuiones.substring(0, 8)
                        }
                    },
                    take: 1
                });
                capacitacion = capacitaciones[0] || null;
            }

            if (!capacitacion) {
                res.status(404).json({ message: 'Código no válido. Verifica el código e intenta de nuevo.' });
                return;
            }

            // 2. Verificar que la capacitación está activa (no finalizada ni cancelada)
            if (capacitacion.estado === EstadoCapacitacionEnum.REALIZADA || capacitacion.estado === EstadoCapacitacionEnum.CANCELADA) {
                res.status(400).json({
                    message: `No se puede confirmar asistencia: la capacitación se encuentra en estado "${capacitacion.estado}"`
                });
                return;
            }

            // 3. Buscar la inscripción del usuario en esta capacitación
            const inscripcion = await prisma.usuarioCapacitacion.findUnique({
                where: {
                    usuarioId_capacitacionId: {
                        usuarioId: userId,
                        capacitacionId: capacitacion.id
                    }
                }
            });

            if (!inscripcion) {
                res.status(404).json({
                    message: 'No estás inscrito en esta capacitación. Debes inscribirte primero.'
                });
                return;
            }

            // 4. Si ya confirmó asistencia, informar sin error
            if (inscripcion.asistio) {
                res.status(200).json({
                    message: 'Tu asistencia ya fue confirmada anteriormente',
                    capacitacion: {
                        id: capacitacion.id,
                        nombre: capacitacion.nombre,
                        fechaInicio: capacitacion.fechaInicio,
                        lugar: capacitacion.lugar
                    },
                    yaConfirmado: true
                });
                return;
            }

            // 5. Marcar asistencia como confirmada
            await prisma.usuarioCapacitacion.update({
                where: { id: inscripcion.id },
                data: { asistio: true }
            });

            res.status(200).json({
                message: '¡Asistencia confirmada exitosamente!',
                capacitacion: {
                    id: capacitacion.id,
                    nombre: capacitacion.nombre,
                    fechaInicio: capacitacion.fechaInicio,
                    lugar: capacitacion.lugar
                },
                yaConfirmado: false
            });
        } catch (error) {
            next(error);
        }
    };
}
