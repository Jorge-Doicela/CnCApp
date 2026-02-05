import { container } from 'tsyringe';
import { PrismaUserRepository } from '../infrastructure/database/repositories/user/prisma-user.repository';
import { PrismaCapacitacionRepository } from '../infrastructure/database/repositories/capacitacion/prisma-capacitacion.repository';
import { PrismaCertificadoRepository } from '../infrastructure/database/repositories/certificado/prisma-certificado.repository';
import { PrismaProvinciaRepository } from '../infrastructure/database/repositories/ubicacion/prisma-provincia.repository';
import { PrismaCantonRepository } from '../infrastructure/database/repositories/ubicacion/prisma-canton.repository';
import { PrismaCargoRepository } from '../infrastructure/database/repositories/prisma-cargo.repository';
import { PrismaInstitucionRepository } from '../infrastructure/database/repositories/prisma-institucion.repository';
import { BcryptPasswordHasher } from '../infrastructure/security/bcrypt-password-hasher';
import { JwtTokenProvider } from '../infrastructure/security/jwt-token-provider';

// Import Auth Use Cases
import { RegisterUserUseCase } from '../application/auth/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../application/auth/use-cases/login-user.use-case';
import { RefreshTokenUseCase } from '../application/auth/use-cases/refresh-token.use-case';
import { RequestPasswordResetUseCase } from '../application/auth/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../application/auth/use-cases/reset-password.use-case';

// Import User Use Cases
import { GetUserProfileUseCase } from '../application/user/use-cases/get-user-profile.use-case';
import { GetAllUsersUseCase } from '../application/user/use-cases/get-all-users.use-case';
import { UpdateUserUseCase } from '../application/user/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../application/user/use-cases/delete-user.use-case';

// Import Capacitacion Use Cases
import { CreateCapacitacionUseCase } from '../application/capacitacion/use-cases/create-capacitacion.use-case';
import { GetAllCapacitacionesUseCase } from '../application/capacitacion/use-cases/get-all-capacitaciones.use-case';
import { UpdateCapacitacionUseCase } from '../application/capacitacion/use-cases/update-capacitacion.use-case';
import { DeleteCapacitacionUseCase } from '../application/capacitacion/use-cases/delete-capacitacion.use-case';

// Import Certificado Use Cases
import { CreateCertificadoUseCase } from '../application/certificado/use-cases/create-certificado.use-case';
import { GetCertificadoByQRUseCase } from '../application/certificado/use-cases/get-certificado-by-qr.use-case';
import { GetUserCertificadosUseCase } from '../application/certificado/use-cases/get-user-certificados.use-case';
import { CountCertificadosUseCase } from '../application/certificado/use-cases/count-certificados.use-case';

// Import Ubicacion Use Cases
import { GetProvinciasUseCase } from '../application/ubicacion/use-cases/get-provincias.use-case';
import { GetCantonesUseCase } from '../application/ubicacion/use-cases/get-cantones.use-case';

// Import Cargos Use Cases
import { GetAllCargosUseCase } from '../application/cargos/use-cases/get-all-cargos.use-case';
import { CreateCargoUseCase } from '../application/cargos/use-cases/create-cargo.use-case';
import { UpdateCargoUseCase } from '../application/cargos/use-cases/update-cargo.use-case';
import { DeleteCargoUseCase } from '../application/cargos/use-cases/delete-cargo.use-case';

// Import Institucion Use Cases
import { GetAllInstitucionesUseCase } from '../application/institucion/use-cases/get-all-instituciones.use-case';

// Import Reportes Use Cases
import { GetDashboardStatsUseCase } from '../application/reportes/use-cases/get-dashboard-stats.use-case';

// Import Controllers
import { AuthController } from '../infrastructure/web/controllers/auth.controller';
import { UserController } from '../infrastructure/web/controllers/user.controller';
import { CapacitacionController } from '../infrastructure/web/controllers/capacitacion.controller';
import { CertificadoController } from '../infrastructure/web/controllers/certificado.controller';
import { ReportesController } from '../infrastructure/web/controllers/reportes.controller';
import { UbicacionController } from '../infrastructure/web/controllers/ubicacion.controller';
import { RolController } from '../infrastructure/web/controllers/rol.controller';
import { EntidadController } from '../infrastructure/web/controllers/entidad.controller';
import { CargoController } from '../infrastructure/web/controllers/cargo.controller';
import { InstitucionController } from '../infrastructure/web/controllers/institucion.controller';

// Import Database
import prisma from './database';

// ============================================
// REGISTER EXTERNAL DEPENDENCIES
// ============================================
container.register('PrismaClient', { useValue: prisma });

// ============================================
// REGISTER REPOSITORIES
// ============================================
import { PrismaRolRepository } from '../infrastructure/database/prisma-rol.repository';
import { PrismaEntidadRepository } from '../infrastructure/database/prisma-entidad.repository';
import { GetAllRolesUseCase } from '../application/user/use-cases/get-all-roles.use-case';
import { GetAllEntidadesUseCase } from '../application/user/use-cases/get-all-entidades.use-case';

container.register('UserRepository', { useClass: PrismaUserRepository });
container.register('RolRepository', { useClass: PrismaRolRepository });
container.register('EntidadRepository', { useClass: PrismaEntidadRepository });
container.register('CapacitacionRepository', { useClass: PrismaCapacitacionRepository });
container.register('CertificadoRepository', { useClass: PrismaCertificadoRepository });
container.register('CargoRepository', { useClass: PrismaCargoRepository });
container.register('InstitucionRepository', { useClass: PrismaInstitucionRepository });

// Ubicacion
container.register('ProvinciaRepository', { useClass: PrismaProvinciaRepository });
container.register('CantonRepository', { useClass: PrismaCantonRepository });

// Register Security Services
container.register('PasswordEncoder', { useClass: BcryptPasswordHasher });
container.register('TokenProvider', { useClass: JwtTokenProvider });

// ============================================
// REGISTER USE CASES
// ============================================

// Auth Use Cases...
container.registerSingleton(RegisterUserUseCase);
container.registerSingleton(LoginUserUseCase);
container.registerSingleton(RefreshTokenUseCase);
container.registerSingleton(RequestPasswordResetUseCase);
container.registerSingleton(ResetPasswordUseCase);

// User Use Cases
container.registerSingleton(GetUserProfileUseCase);
container.registerSingleton(GetAllUsersUseCase);
container.registerSingleton(UpdateUserUseCase);
container.registerSingleton(DeleteUserUseCase);
container.registerSingleton(GetAllRolesUseCase);
container.registerSingleton(GetAllEntidadesUseCase);

// Capacitacion Use Cases
container.registerSingleton(CreateCapacitacionUseCase);
container.registerSingleton(GetAllCapacitacionesUseCase);
container.registerSingleton(UpdateCapacitacionUseCase);
container.registerSingleton(DeleteCapacitacionUseCase);

// Certificado Use Cases
container.registerSingleton(CreateCertificadoUseCase);
container.registerSingleton(GetCertificadoByQRUseCase);
container.registerSingleton(GetUserCertificadosUseCase);
container.registerSingleton(CountCertificadosUseCase);

// Ubicacion Use Cases
container.registerSingleton(GetProvinciasUseCase);
container.registerSingleton(GetCantonesUseCase);

// Cargo Use Cases
container.registerSingleton(GetAllCargosUseCase);
container.registerSingleton(CreateCargoUseCase);
container.registerSingleton(UpdateCargoUseCase);
container.registerSingleton(DeleteCargoUseCase);

// Institucion Use Cases
container.registerSingleton(GetAllInstitucionesUseCase);

// Reportes Use Cases
container.registerSingleton(GetDashboardStatsUseCase);

// ============================================
// REGISTER CONTROLLERS
// ============================================
container.registerSingleton(AuthController);
container.registerSingleton(UserController);
container.registerSingleton(RolController);
container.registerSingleton(EntidadController);
container.registerSingleton(CapacitacionController);
container.registerSingleton(CertificadoController);
container.registerSingleton(ReportesController);
container.registerSingleton(UbicacionController);
container.registerSingleton(CargoController);
container.registerSingleton(InstitucionController);

export { container };
