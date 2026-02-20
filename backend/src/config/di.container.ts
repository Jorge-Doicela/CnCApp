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
import { PrismaRolRepository } from '../infrastructure/database/prisma-rol.repository';
import { PrismaEntidadRepository } from '../infrastructure/database/prisma-entidad.repository';
import { PrismaReportesRepository } from '../infrastructure/database/repositories/reportes/prisma-reportes.repository';

// Import Auth Use Cases
import { RegisterUserUseCase } from '../application/auth/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../application/auth/use-cases/login-user.use-case';
import { RefreshTokenUseCase } from '../application/auth/use-cases/refresh-token.use-case';
import { RequestPasswordResetUseCase } from '../application/auth/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../application/auth/use-cases/reset-password.use-case';

// Import User Use Cases
import { GetUserProfileUseCase } from '../application/user/use-cases/get-user-profile.use-case';
import { GetAllUsersUseCase } from '../application/user/use-cases/get-all-users.use-case';
import { GetAllEntidadesUseCase } from '../application/user/use-cases/get-all-entidades.use-case';
import { GetEntidadByIdUseCase } from '../application/user/use-cases/get-entidad-by-id.use-case';
import { CreateEntidadUseCase } from '../application/user/use-cases/create-entidad.use-case';
import { UpdateEntidadUseCase } from '../application/user/use-cases/update-entidad.use-case';
import { DeleteEntidadUseCase } from '../application/user/use-cases/delete-entidad.use-case';
import { UpdateUserUseCase } from '../application/user/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../application/user/use-cases/delete-user.use-case';

// Import Capacitacion Use Cases
import { CreateCapacitacionUseCase } from '../application/capacitacion/use-cases/create-capacitacion.use-case';
import { GetAllCapacitacionesUseCase } from '../application/capacitacion/use-cases/get-all-capacitaciones.use-case';
import { GetCapacitacionByIdUseCase } from '../application/capacitacion/use-cases/get-capacitacion-by-id.use-case';
import { UpdateCapacitacionUseCase } from '../application/capacitacion/use-cases/update-capacitacion.use-case';
import { DeleteCapacitacionUseCase } from '../application/capacitacion/use-cases/delete-capacitacion.use-case';

// Import Certificado Use Cases
import { CreateCertificadoUseCase } from '../application/certificado/use-cases/create-certificado.use-case';
import { GetCertificadoByQRUseCase } from '../application/certificado/use-cases/get-certificado-by-qr.use-case';
import { GetUserCertificadosUseCase } from '../application/certificado/use-cases/get-user-certificados.use-case';
import { CountCertificadosUseCase } from '../application/certificado/use-cases/count-certificados.use-case';
import { CertificateGeneratorService } from '../infrastructure/services/certificate-generator.service';
import { GenerateCertificadoUseCase } from '../application/certificado/use-cases/generate-certificado.use-case';

// Import Ubicacion Use Cases
import { GetProvinciasUseCase } from '../application/ubicacion/use-cases/get-provincias.use-case';
import { GetCantonesUseCase } from '../application/ubicacion/use-cases/get-cantones.use-case';

// Import Cargos Use Cases
import { GetAllCargosUseCase } from '../application/cargos/use-cases/get-all-cargos.use-case';
import { GetCargoByIdUseCase } from '../application/cargos/use-cases/get-cargo-by-id.use-case';
import { CreateCargoUseCase } from '../application/cargos/use-cases/create-cargo.use-case';
import { UpdateCargoUseCase } from '../application/cargos/use-cases/update-cargo.use-case';
import { DeleteCargoUseCase } from '../application/cargos/use-cases/delete-cargo.use-case';

// Import Institucion Use Cases
import { GetAllInstitucionesUseCase } from '../application/institucion/use-cases/get-all-instituciones.use-case';

// Import Reportes Use Cases
import { GetDashboardStatsUseCase } from '../application/reportes/use-cases/get-dashboard-stats.use-case';

import { GetInscritosUseCase } from '../application/usuario-capacitacion/use-cases/get-inscritos.use-case';
import { InscribirUsuarioUseCase } from '../application/usuario-capacitacion/use-cases/inscribir-usuario.use-case';
import { EliminarInscripcionUseCase } from '../application/usuario-capacitacion/use-cases/eliminar-inscripcion.use-case';
import { ActualizarAsistenciaUseCase } from '../application/usuario-capacitacion/use-cases/actualizar-asistencia.use-case';

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
import { UsuarioCapacitacionController } from '../infrastructure/web/controllers/usuario-capacitacion.controller';
import { PrismaUsuarioCapacitacionRepository } from '../infrastructure/repositories/usuario-capacitacion.repository.impl';

// Import Database
import prisma from './database';

import { GetAllRolesUseCase } from '../application/user/use-cases/get-all-roles.use-case';
import { CreateRolUseCase } from '../application/user/use-cases/create-rol.use-case';
import { GetRolByIdUseCase } from '../application/user/use-cases/get-rol-by-id.use-case';
import { UpdateRolUseCase } from '../application/user/use-cases/update-rol.use-case';
import { DeleteRolUseCase } from '../application/user/use-cases/delete-rol.use-case';

import { PrismaPlantillaRepository } from '../infrastructure/database/prisma-plantilla.repository';
import { CreatePlantillaUseCase } from '../application/plantilla/use-cases/create-plantilla.use-case';
import { GetAllPlantillasUseCase } from '../application/plantilla/use-cases/get-all-plantillas.use-case';
import { GetPlantillaByIdUseCase } from '../application/plantilla/use-cases/get-plantilla-by-id.use-case';
import { UpdatePlantillaUseCase } from '../application/plantilla/use-cases/update-plantilla.use-case';
import { DeletePlantillaUseCase } from '../application/plantilla/use-cases/delete-plantilla.use-case';
import { ActivarPlantillaUseCase } from '../application/plantilla/use-cases/activar-plantilla.use-case';
import { PlantillaController } from '../infrastructure/web/controllers/plantilla.controller';

// ============================================
// REGISTER EXTERNAL DEPENDENCIES
// ============================================
container.register('PrismaClient', { useValue: prisma });

// ============================================
// REGISTER REPOSITORIES
// ============================================




container.register('UserRepository', { useClass: PrismaUserRepository });
container.register('RolRepository', { useClass: PrismaRolRepository });
container.register('EntidadRepository', { useClass: PrismaEntidadRepository });
container.register('CapacitacionRepository', { useClass: PrismaCapacitacionRepository });
container.register('CertificadoRepository', { useClass: PrismaCertificadoRepository });
container.register('CargoRepository', { useClass: PrismaCargoRepository });
container.register('InstitucionRepository', { useClass: PrismaInstitucionRepository });
container.register('ReportesRepository', { useClass: PrismaReportesRepository });

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
container.registerSingleton(CreateRolUseCase);
container.registerSingleton(UpdateRolUseCase);
container.registerSingleton(DeleteRolUseCase);
container.registerSingleton(GetRolByIdUseCase);
container.registerSingleton(GetAllEntidadesUseCase);
container.registerSingleton(GetEntidadByIdUseCase);
container.registerSingleton(CreateEntidadUseCase);
container.registerSingleton(UpdateEntidadUseCase);
container.registerSingleton(DeleteEntidadUseCase);

// Capacitacion Use Cases
container.registerSingleton(CreateCapacitacionUseCase);
container.registerSingleton(GetAllCapacitacionesUseCase);
container.registerSingleton(GetCapacitacionByIdUseCase);
container.registerSingleton(UpdateCapacitacionUseCase);
container.registerSingleton(DeleteCapacitacionUseCase);

// Certificado Use Cases
container.registerSingleton(CreateCertificadoUseCase);
container.registerSingleton(GetCertificadoByQRUseCase);
container.registerSingleton(GetUserCertificadosUseCase);
container.registerSingleton(CountCertificadosUseCase);

container.registerSingleton(CertificateGeneratorService);
container.registerSingleton(GenerateCertificadoUseCase);

// Ubicacion Use Cases
container.registerSingleton(GetProvinciasUseCase);
container.registerSingleton(GetCantonesUseCase);

// Cargo Use Cases
container.registerSingleton(GetAllCargosUseCase);
container.registerSingleton(GetCargoByIdUseCase);
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

// Import UsuarioCapacitacion Use Cases


// Import Controllers
// ... (existing imports)


// ... (existing code)

// Register Repositories
container.register('UsuarioCapacitacionRepository', { useClass: PrismaUsuarioCapacitacionRepository });

// ... (existing code)

// Register Use Cases
container.registerSingleton(GetInscritosUseCase);
container.registerSingleton(InscribirUsuarioUseCase);
container.registerSingleton(EliminarInscripcionUseCase);
container.registerSingleton(ActualizarAsistenciaUseCase);

// ... (existing code)

// Register Controller
container.registerSingleton(UsuarioCapacitacionController);



// ... (existing code)

// Register Plantilla Repository
container.register('PlantillaRepository', { useClass: PrismaPlantillaRepository });

// Register Plantilla Use Cases
container.registerSingleton(CreatePlantillaUseCase);
container.registerSingleton(GetAllPlantillasUseCase);
container.registerSingleton(GetPlantillaByIdUseCase);
container.registerSingleton(UpdatePlantillaUseCase);
container.registerSingleton(DeletePlantillaUseCase);
container.registerSingleton(ActivarPlantillaUseCase);

// Register Plantilla Controller
container.registerSingleton(PlantillaController);

export { container };
