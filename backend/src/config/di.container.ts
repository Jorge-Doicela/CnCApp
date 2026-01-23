import { container } from 'tsyringe';
import { PrismaUserRepository } from '../infrastructure/database/repositories/user/prisma-user.repository';
import { PrismaCapacitacionRepository } from '../infrastructure/database/repositories/capacitacion/prisma-capacitacion.repository';
import { PrismaCertificadoRepository } from '../infrastructure/database/repositories/certificado/prisma-certificado.repository';
import { BcryptPasswordHasher } from '../infrastructure/security/bcrypt-password-hasher';
import { JwtTokenProvider } from '../infrastructure/security/jwt-token-provider';

// Register Repositories
container.register('UserRepository', { useClass: PrismaUserRepository });
container.register('CapacitacionRepository', { useClass: PrismaCapacitacionRepository });
container.register('CertificadoRepository', { useClass: PrismaCertificadoRepository });

// Register Security Services
container.register('PasswordEncoder', { useClass: BcryptPasswordHasher });
container.register('TokenProvider', { useClass: JwtTokenProvider });

export { container };
