import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

const registerSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    ci: z.string().length(10, 'La cédula debe tener 10 dígitos'),
    email: z.string().email('Email inválido').optional(),
    telefono: z.string().optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    tipoParticipante: z.number().int().min(0).max(3).optional()
});

const loginSchema = z.object({
    ci: z.string().length(10, 'La cédula debe tener 10 dígitos'),
    password: z.string().min(1, 'La contraseña es requerida')
});

// ============================================
// CONTROLADORES
// ============================================

/**
 * Registrar nuevo usuario
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
    try {
        // Validar datos
        const data = registerSchema.parse(req.body);

        // Verificar si el CI ya existe
        const existingUser = await prisma.usuario.findUnique({
            where: { ci: data.ci }
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'La cédula ya está registrada'
            });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Crear usuario
        const user = await prisma.usuario.create({
            data: {
                nombre: data.nombre,
                ci: data.ci,
                email: data.email,
                telefono: data.telefono,
                password: hashedPassword,
                tipoParticipante: data.tipoParticipante || 0,
                rolId: 2 // Rol de usuario regular por defecto
            },
            select: {
                id: true,
                nombre: true,
                ci: true,
                email: true,
                telefono: true,
                tipoParticipante: true,
                rolId: true,
                createdAt: true
            }
        });

        // Generar token JWT
        const token = jwt.sign(
            {
                userId: user.id,
                userRole: user.rolId
            },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user,
            token
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Datos inválidos',
                details: error.errors
            });
        }

        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

/**
 * Iniciar sesión
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
    try {
        // Validar datos
        const data = loginSchema.parse(req.body);

        // Buscar usuario por CI
        const user = await prisma.usuario.findUnique({
            where: { ci: data.ci },
            include: {
                rol: {
                    select: {
                        id: true,
                        nombre: true,
                        modulos: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Cédula o contraseña incorrectos'
            });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(data.password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Cédula o contraseña incorrectos'
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                userId: user.id,
                userRole: user.rolId
            },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Remover password de la respuesta
        const { password, ...userWithoutPassword } = user;

        res.json({
            message: 'Inicio de sesión exitoso',
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Datos inválidos',
                details: error.errors
            });
        }

        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

/**
 * Obtener perfil del usuario autenticado
 * GET /api/auth/profile
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.usuario.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                nombre: true,
                ci: true,
                email: true,
                telefono: true,
                tipoParticipante: true,
                fotoPerfilUrl: true,
                firmaUrl: true,
                createdAt: true,
                rol: {
                    select: {
                        id: true,
                        nombre: true,
                        modulos: true
                    }
                },
                entidad: {
                    select: {
                        id: true,
                        nombre: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
};
