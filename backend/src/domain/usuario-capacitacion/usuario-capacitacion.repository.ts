import { UsuarioCapacitacion } from './entities/usuario-capacitacion.entity';

export interface UsuarioCapacitacionRepository {
    findByCapacitacionId(capacitacionId: number): Promise<UsuarioCapacitacion[]>;
    findByUsuarioId(usuarioId: number): Promise<UsuarioCapacitacion[]>;
    create(data: Partial<UsuarioCapacitacion>): Promise<UsuarioCapacitacion>;
    update(id: number, data: Partial<UsuarioCapacitacion>): Promise<UsuarioCapacitacion>;
    delete(id: number): Promise<void>;
    deleteByCapacitacionAndUser(capacitacionId: number, usuarioId: number): Promise<void>;
    deleteNoAsistieron(capacitacionId: number): Promise<void>;
    updateAsistencia(id: number, asistio: boolean): Promise<UsuarioCapacitacion>;
    updateAsistenciaMasiva(capacitacionId: number, asistio: boolean): Promise<void>;
}
