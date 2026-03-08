import { injectable } from 'tsyringe';
import prisma from '../../../../config/database';
import { User } from '../../../../domain/user/entities/user.entity';
import { UserRepository } from '../../../../domain/user/user.repository';
import { UserMapper } from '../../../../domain/user/mappers/user.mapper';

@injectable()
export class PrismaUserRepository implements UserRepository {
    async create(user: Partial<User>): Promise<User> {
        try {
            const createdUser = await prisma.usuario.create({
                data: {
                    nombre: user.nombre!,
                    primerNombre: user.primerNombre,
                    segundoNombre: user.segundoNombre,
                    primerApellido: user.primerApellido,
                    segundoApellido: user.segundoApellido,
                    ci: user.ci!,
                    email: user.email,
                    telefono: user.telefono,
                    celular: user.celular,
                    password: user.password!,
                    generoId: user.generoId,
                    etniaId: user.etniaId,
                    nacionalidadId: user.nacionalidadId,
                    fechaNacimiento: user.fechaNacimiento,
                    provinciaId: user.provinciaId,
                    cantonId: user.cantonId,
                    tipoParticipanteId: user.tipoParticipanteId || null,
                    rolId: user.rolId,
                    entidadId: user.entidadId,
                    fotoPerfilUrl: user.fotoPerfilUrl,
                    firmaUrl: user.firmaUrl,
                    ...(user.autoridad && {
                        autoridades: {
                            create: [{
                                cargo: user.autoridad.cargo,
                                entidad: user.autoridad.gadAutoridad
                            }]
                        }
                    }),
                    ...(user.funcionarioGad && {
                        funcionarios: {
                            create: [{
                                cargo: user.funcionarioGad.cargo,
                                departamento: user.funcionarioGad.gadFuncionarioGad,
                                ...(user.funcionarioGad.competencias?.length > 0 && {
                                    competencias: {
                                        connect: user.funcionarioGad.competencias.map((c: any) => ({ id: Number(c) }))
                                    }
                                })
                            }]
                        }
                    }),
                    ...(user.institucion && {
                        instituciones: {
                            create: [{
                                institucionId: Number(user.institucion.institucion),
                                gradoOcupacionalId: user.institucion.gradoOcupacional ? Number(user.institucion.gradoOcupacional) : null
                            }]
                        }
                    })
                },
                include: {
                    rol: true,
                    entidad: true,
                    provincia: true,
                    canton: true,
                    tipoParticipante: true,
                    nacionalidad: true
                }
            });
            return UserMapper.toDomain(createdUser);
        } catch (error: any) {
            throw error;
        }
    }

    async findByCi(ci: string): Promise<User | null> {
        const user = await prisma.usuario.findUnique({
            where: { ci },
            include: {
                rol: true,
                entidad: true,
                provincia: true,
                canton: true,
                nacionalidad: true
            }
        });
        return user ? UserMapper.toDomain(user) : null;
    }

    async findById(id: number): Promise<User | null> {
        const user = await prisma.usuario.findUnique({
            where: { id },
            include: {
                rol: true,
                entidad: true,
                provincia: true,
                canton: true,
                tipoParticipante: true,
                nacionalidad: true,
                autoridades: true,
                funcionarios: {
                    include: {
                        competencias: true
                    }
                },
                instituciones: {
                    include: {
                        institucion: true,
                        gradoOcupacional: true
                    }
                },
                _count: {
                    select: {
                        inscripciones: true,
                        certificados: true
                    }
                }
            }
        });
        return user ? UserMapper.toDomain(user) : null;
    }

    async update(id: number, userData: Partial<User>): Promise<User> {
        const user = await prisma.usuario.update({
            where: { id },
            data: {
                nombre: userData.nombre,
                primerNombre: userData.primerNombre,
                segundoNombre: userData.segundoNombre,
                primerApellido: userData.primerApellido,
                segundoApellido: userData.segundoApellido,
                email: userData.email,
                telefono: userData.telefono,
                celular: userData.celular,
                generoId: userData.generoId,
                etniaId: userData.etniaId,
                nacionalidadId: userData.nacionalidadId,
                fechaNacimiento: userData.fechaNacimiento,
                provinciaId: userData.provinciaId,
                cantonId: userData.cantonId,
                tipoParticipanteId: userData.tipoParticipanteId,
                rolId: userData.rolId,
                entidadId: userData.entidadId,
                fotoPerfilUrl: userData.fotoPerfilUrl,
                firmaUrl: userData.firmaUrl,
                password: userData.password, // Allow updating password through generic update
                ...(userData.autoridad !== undefined && {
                    autoridades: {
                        deleteMany: {},
                        ...(userData.autoridad !== null && {
                            create: [{
                                cargo: userData.autoridad.cargo,
                                entidad: userData.autoridad.gadAutoridad
                            }]
                        })
                    }
                }),
                ...(userData.funcionarioGad !== undefined && {
                    funcionarios: {
                        deleteMany: {},
                        ...(userData.funcionarioGad !== null && {
                            create: [{
                                cargo: userData.funcionarioGad.cargo,
                                departamento: userData.funcionarioGad.gadFuncionarioGad,
                                ...(userData.funcionarioGad.competencias?.length > 0 && {
                                    competencias: {
                                        set: userData.funcionarioGad.competencias.map((c: any) => ({ id: Number(c) }))
                                    }
                                })
                            }]
                        })
                    }
                }),
                ...(userData.institucion !== undefined && {
                    instituciones: {
                        deleteMany: {},
                        ...(userData.institucion !== null && {
                            create: [{
                                institucionId: Number(userData.institucion.institucion),
                                gradoOcupacionalId: userData.institucion.gradoOcupacional ? Number(userData.institucion.gradoOcupacional) : null
                            }]
                        })
                    }
                })
            },
            include: {
                rol: true,
                entidad: true,
                provincia: true,
                canton: true,
                tipoParticipante: true,
                nacionalidad: true
            }
        });
        return UserMapper.toDomain(user);
    }

    async findAll(): Promise<User[]> {
        const users = await prisma.usuario.findMany({
            include: {
                rol: true,
                entidad: true,
                tipoParticipante: true,
                nacionalidad: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return users.map(user => UserMapper.toDomain(user));
    }

    async delete(id: number): Promise<void> {
        await prisma.usuario.delete({
            where: { id }
        });
    }

    async findByAuthUid(authUid: string): Promise<User | null> {
        const user = await prisma.usuario.findUnique({
            where: { authUid },
            include: {
                rol: true,
                entidad: true,
                provincia: true,
                canton: true,
                tipoParticipante: true,
                nacionalidad: true,
                autoridades: true,
                funcionarios: {
                    include: {
                        competencias: true
                    }
                },
                instituciones: {
                    include: {
                        institucion: true,
                        gradoOcupacional: true
                    }
                },
                _count: {
                    select: {
                        inscripciones: true,
                        certificados: true
                    }
                }
            }
        });
        return user ? UserMapper.toDomain(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.usuario.findFirst({
            where: { email },
            include: {
                rol: true,
                entidad: true,
                provincia: true,
                canton: true,
                tipoParticipante: true,
                nacionalidad: true,
                autoridades: true,
                funcionarios: {
                    include: {
                        competencias: true
                    }
                },
                instituciones: {
                    include: {
                        institucion: true,
                        gradoOcupacional: true
                    }
                }
            }
        });
        return user ? UserMapper.toDomain(user) : null;
    }

    async save(user: User): Promise<User> {
        if (user.id && user.id > 0) {
            return this.update(user.id, user);
        } else {
            return this.create(user);
        }
    }
}
