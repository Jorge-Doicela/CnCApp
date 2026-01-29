import { container } from 'tsyringe';
import { PrismaUserRepository } from '../infrastructure/database/repositories/user/prisma-user.repository';
import { PrismaCapacitacionRepository } from '../infrastructure/database/repositories/capacitacion/prisma-capacitacion.repository';
import { PrismaCertificadoRepository } from '../infrastructure/database/repositories/certificado/prisma-certificado.repository';
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

// Import Controllers
import { AuthController } from '../infrastructure/web/controllers/auth.controller';
import { UserController } from '../infrastructure/web/controllers/user.controller';
import { CapacitacionController } from '../infrastructure/web/controllers/capacitacion.controller';
import { CertificadoController } from '../infrastructure/web/controllers/certificado.controller';

// ============================================
// REGISTER REPOSITORIES
// ============================================
container.register('UserRepository', { useClass: PrismaUserRepository });
container.register('CapacitacionRepository', { useClass: PrismaCapacitacionRepository });
container.register('CertificadoRepository', { useClass: PrismaCertificadoRepository });

// ============================================
// REGISTER SECURITY SERVICES
// ============================================
container.register('PasswordEncoder', { useClass: BcryptPasswordHasher });
container.register('TokenProvider', { useClass: JwtTokenProvider });

// ============================================
// REGISTER USE CASES
// ============================================

// Auth Use Cases
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

// Capacitacion Use Cases
container.registerSingleton(CreateCapacitacionUseCase);
container.registerSingleton(GetAllCapacitacionesUseCase);
container.registerSingleton(UpdateCapacitacionUseCase);
container.registerSingleton(DeleteCapacitacionUseCase);

// Certificado Use Cases
container.registerSingleton(CreateCertificadoUseCase);
container.registerSingleton(GetCertificadoByQRUseCase);
container.registerSingleton(GetUserCertificadosUseCase);

// ============================================
// REGISTER CONTROLLERS
// ============================================
container.registerSingleton(AuthController);
container.registerSingleton(UserController);
container.registerSingleton(CapacitacionController);
container.registerSingleton(CertificadoController);

export { container };
