/**
 * Registro centralizado de las entidades simples (id + nombre) en el DI container.
 *
 * En lugar de registrar 5 use-cases × 3 entidades = 15 clases duplicadas,
 * aquí se instancian directamente los servicios y controladores genéricos.
 *
 * ENTIDADES GESTIONADAS AQUÍ:
 *  - Cargo
 *  - GradoOcupacional
 *  - Mancomunidad
 */
import { container } from 'tsyringe';
import { PrismaSimpleEntityRepository } from '../infrastructure/database/repositories/prisma-simple-entity.repository';
import { SimpleEntityService } from '../application/shared/simple-entity.service';
import { SimpleEntityController } from '../infrastructure/web/controllers/simple-entity.controller';

// ─── CARGO ────────────────────────────────────────────────────────────────────
const cargoRepo = new PrismaSimpleEntityRepository('cargo');
const cargoService = new SimpleEntityService(cargoRepo, 'Cargo');
export const cargoController = new SimpleEntityController(cargoService);

// ─── GRADO OCUPACIONAL ────────────────────────────────────────────────────────
const gradoRepo = new PrismaSimpleEntityRepository('gradoOcupacional');
const gradoService = new SimpleEntityService(gradoRepo, 'Grado Ocupacional');
export const gradoOcupacionalController = new SimpleEntityController(gradoService);

// ─── MANCOMUNIDAD ─────────────────────────────────────────────────────────────
const mancomunidadRepo = new PrismaSimpleEntityRepository('mancomunidad');
const mancomunidadService = new SimpleEntityService(mancomunidadRepo, 'Mancomunidad');
export const mancomunidadController = new SimpleEntityController(mancomunidadService);
