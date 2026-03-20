import { injectable, inject } from 'tsyringe';
import { CertificadoRepository } from '../../../domain/certificado/repositories/certificado.repository';
import { CertificateGeneratorService } from '../../../infrastructure/services/certificate-generator.service';
import { UserRepository } from '../../../domain/user/user.repository';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';
import { env } from '../../../config/env';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';
import { EmailService } from '../../../infrastructure/services/email.service';
import logger from '../../../config/logger';
import { NotFoundError } from '../../../domain/shared/errors';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';

@injectable()
export class GenerateCertificadoUseCase {
    constructor(
        @inject('CertificadoRepository') private certificadoRepository: CertificadoRepository,
        @inject(CertificateGeneratorService) private generatorService: CertificateGeneratorService,
        @inject('UserRepository') private userRepository: UserRepository,
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository,
        @inject('UsuarioCapacitacionRepository') private usuarioCapacitacionRepository: UsuarioCapacitacionRepository,
        @inject('PlantillaRepository') private plantillaRepository: PlantillaRepository,
        @inject(EmailService) private emailService: EmailService
    ) { }

    private prepareCertificateData(usuario: any, capacitacion: any): any {
        const sanitizeName = (val?: string | null) => 
            (!val || val.toString().trim() === '' || val === 'null' || val === 'undefined') ? '' : val.trim();

        const fullUserDisplayName = [
            sanitizeName(usuario.primerNombre),
            sanitizeName(usuario.segundoNombre),
            sanitizeName(usuario.primerApellido),
            sanitizeName(usuario.segundoApellido)
        ].filter(Boolean).join(' ').toUpperCase() || (usuario.nombre || '').replace(/\s*null\s*/g, ' ').trim().toUpperCase();

        const cursoFecha = capacitacion.fechaInicio || new Date();

        return {
            usuario: fullUserDisplayName,
            curso: capacitacion.nombre.toUpperCase(),
            fecha: cursoFecha.toLocaleDateString('es-ES', { 
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
            }),
            cedula: usuario.ci,
            rol: (usuario.rolCapacitacion || 'Participante').toUpperCase(),
            horas: `${capacitacion.horas || 0} horas`,
            modalidad: (capacitacion.modalidad || 'virtual').toLowerCase(),
            nombreUsuario: fullUserDisplayName
        };
    }

    async execute(usuarioId: number, capacitacionId: number): Promise<string> {
        logger.info(`[GEN_CERT] Iniciando proceso para Usuario=${usuarioId}, Cap=${capacitacionId}`);

        // 0. Check if already exists
        const existing = await this.certificadoRepository.findByUserAndCapacitacion(usuarioId, capacitacionId);
        if (existing) {
            logger.info(`[GEN_CERT] Certificado ya existe para Usuario=${usuarioId}, Cap=${capacitacionId}. URL: ${existing.pdfUrl}`);
            return existing.pdfUrl;
        }

        // 0.5 Check Attendance
        const inscripcion = await this.usuarioCapacitacionRepository.findByUserAndCapacitacion(usuarioId, capacitacionId);
        if (!inscripcion || !inscripcion.asistio) {
            logger.warn(`[GEN_CERT] Usuario=${usuarioId} no puede recibir certificado en Cap=${capacitacionId} (Asistencia: ${!!inscripcion?.asistio})`);
            throw new Error('El usuario no tiene asistencia confirmada para este evento');
        }

        // 1. Fetch data
        const usuario = await this.userRepository.findById(usuarioId);
        const capacitacion = await this.capacitacionRepository.findById(capacitacionId);

        if (!usuario || !capacitacion) {
            throw new NotFoundError('Usuario o Capacitación no encontrada');
        }

        const capAny = capacitacion as any;
        const plantillaId = capAny.plantillaId;
        if (!plantillaId) {
            logger.error(`[GEN_CERT] Capacitación ID=${capacitacionId} no tiene plantilla asignada.`);
            throw new Error('La capacitación no tiene una plantilla asignada');
        }

        const plantilla = await this.plantillaRepository.findById(plantillaId);
        if (!plantilla) {
            throw new NotFoundError(`Plantilla ID=${plantillaId} no encontrada`);
        }

        // 2. Prepare content
        const data = this.prepareCertificateData({ ...usuario, rolCapacitacion: inscripcion.rolCapacitacion }, capacitacion);
        const config = plantilla.configuracion || {};
        const hash = crypto.randomBytes(12).toString('hex');

        // Verification URL
        const baseUrl = env.FRONTEND_URL.endsWith('/') ? env.FRONTEND_URL.slice(0, -1) : env.FRONTEND_URL;
        const qrCodeUrl = `${baseUrl}/validar-certificados?hash=${hash}`;

        // 3. Output Path
        const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR || 'public/uploads');
        const certificatesDir = path.join(uploadDir, 'certificados');
        if (!fs.existsSync(certificatesDir)) {
            fs.mkdirSync(certificatesDir, { recursive: true });
        }

        const fileName = `cert_${usuarioId}_${capacitacionId}_${hash.substring(0, 8)}.pdf`;
        const outputPath = path.join(certificatesDir, fileName);

        // 4. Generate PDF
        logger.info(`[GEN_CERT] Generando PDF: ${fileName} con plantilla ${plantilla.id}`);
        await this.generatorService.generate(
            plantilla.imagenUrl || '',
            config as any,
            data,
            qrCodeUrl,
            outputPath,
            plantilla.firmas as any || []
        );

        // 5. Save in DB
        const publicUrl = `/uploads/certificados/${fileName}`;
        await this.certificadoRepository.create({
            usuarioId,
            capacitacionId,
            codigoQR: hash,
            pdfUrl: publicUrl
        });

        logger.info(`[GEN_CERT] Certificado guardado y listo en: ${publicUrl}`);

        // 6. Send Email (Async)
        if (usuario.email) {
            logger.info(`[GEN_CERT] Enviando correo a ${usuario.email}...`);
            this.emailService.sendCertificateEmail(
                usuario.email,
                data.usuario,
                capacitacion.nombre,
                outputPath
            ).catch(err => {
                logger.error(`[GEN_CERT] Error enviando correo a ${usuario.email}: ${err}`);
            });
        }

        return publicUrl;
    }
}
