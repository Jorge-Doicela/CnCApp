import { injectable } from 'tsyringe';
import prisma from '../../config/database';
import { UsuarioCapacitacion } from '../../domain/usuario-capacitacion/entities/usuario-capacitacion.entity';
import { UsuarioCapacitacionRepository } from '../../domain/usuario-capacitacion/usuario-capacitacion.repository';

@injectable()
export class PrismaUsuarioCapacitacionRepository implements UsuarioCapacitacionRepository {

    async findByCapacitacionId(capacitacionId: number): Promise<UsuarioCapacitacion[]> {
        const result = await prisma.usuarioCapacitacion.findMany({
            where: { capacitacionId },
            include: {
                usuario: true
            }
        });
        return result as unknown as UsuarioCapacitacion[];
    }

    async findByUsuarioId(usuarioId: number): Promise<UsuarioCapacitacion[]> {
        const result = await prisma.usuarioCapacitacion.findMany({
            where: { usuarioId },
            include: {
                capacitacion: true
            }
        });
        return result as unknown as UsuarioCapacitacion[];
    }

    async create(data: Partial<UsuarioCapacitacion>): Promise<UsuarioCapacitacion> {
        // @ts-ignore: rolCapacitacion might not be in generated client yet
        const { rolCapacitacion, ...rest } = data;

        const result = await prisma.usuarioCapacitacion.create({
            data: {
                usuarioId: data.usuarioId!,
                capacitacionId: data.capacitacionId!,
                // @ts-ignore
                rolCapacitacion: rolCapacitacion || 'Participante',
                asistio: data.asistio || false,
                estadoInscripcion: data.estadoInscripcion || 'Activa'
            },
            include: {
                usuario: true,
                capacitacion: true
            }
        });
        return result as unknown as UsuarioCapacitacion;
    }

    async update(id: number, data: Partial<UsuarioCapacitacion>): Promise<UsuarioCapacitacion> {
        // @ts-ignore
        const { rolCapacitacion, ...rest } = data;

        const result = await prisma.usuarioCapacitacion.update({
            where: { id },
            data: {
                asistio: data.asistio,
                // @ts-ignore
                rolCapacitacion: rolCapacitacion,
                estadoInscripcion: data.estadoInscripcion
            }
        });
        return result as unknown as UsuarioCapacitacion;
    }

    async delete(id: number): Promise<void> {
        await prisma.usuarioCapacitacion.delete({
            where: { id }
        });
    }

    async deleteByCapacitacionAndUser(capacitacionId: number, usuarioId: number): Promise<void> {
        // Prisma doesn't support delete on composite key easily without unique input, 
        // but we have a unique constraint @@unique([usuarioId, capacitacionId])
        // So we can use delete with that unique key.
        await prisma.usuarioCapacitacion.delete({
            where: {
                usuarioId_capacitacionId: {
                    usuarioId,
                    capacitacionId
                }
            }
        });
    }

    async deleteNoAsistieron(capacitacionId: number): Promise<void> {
        await prisma.usuarioCapacitacion.deleteMany({
            where: {
                capacitacionId,
                asistio: false
            }
        });
    }

    async updateAsistencia(id: number, asistio: boolean): Promise<UsuarioCapacitacion> {
        const result = await prisma.usuarioCapacitacion.update({
            where: { id },
            data: { asistio }
        });
        return result as unknown as UsuarioCapacitacion;
    }

    async updateAsistenciaMasiva(capacitacionId: number, asistio: boolean): Promise<void> {
        await prisma.usuarioCapacitacion.updateMany({
            where: { capacitacionId },
            data: { asistio }
        });
    }
}
