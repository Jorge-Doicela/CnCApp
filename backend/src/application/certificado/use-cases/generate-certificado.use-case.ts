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
import os from 'os';

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

    async execute(
        usuarioId: number, 
        capacitacionId: number, 
        force: boolean = false,
        preFetchedData?: {
            usuario?: any;
            capacitacion?: any;
            plantilla?: any;
            backgroundBuffer?: Buffer;
        }
    ): Promise<string> {
        logger.info(`[GEN_CERT] Iniciando proceso para Usuario=${usuarioId}, Cap=${capacitacionId}${force ? ' (FORCE)' : ''}${preFetchedData ? ' (PRE-FETCH)' : ''}`);

        // 0. Check if already exists AND file exists on disk
        const existing = await this.certificadoRepository.findByUserAndCapacitacion(usuarioId, capacitacionId);
        if (existing && !force) {
            const url = existing.pdfUrl || '';
            const filePath = path.join(process.cwd(), url.startsWith('/') ? url.slice(1) : url);
            
            // If DB says it exists but file is gone (e.g., Railway restart), we continue to regenerate
            if (fs.existsSync(filePath)) {
                return url;
            }
            logger.info(`[GEN_CERT] Registro existe en DB pero archivo no encontrado en ${filePath}. Regenerando...`);
        }

        if (existing && force) {
            await this.certificadoRepository.delete(existing.id);
        }

        // 0.5 Check Attendance (Optimizable if we pass inscripcion too, but let's keep it simple for now)
        const inscripcion = await this.usuarioCapacitacionRepository.findByUserAndCapacitacion(usuarioId, capacitacionId);
        if (!inscripcion || !inscripcion.asistio) {
            throw new Error('El usuario no tiene asistencia confirmada para este evento');
        }

        // 1. Fetch data or use pre-fetched
        const usuario = preFetchedData?.usuario || await this.userRepository.findById(usuarioId);
        const capacitacion = preFetchedData?.capacitacion || await this.capacitacionRepository.findById(capacitacionId);

        if (!usuario || !capacitacion) {
            throw new NotFoundError('Usuario o Capacitación no encontrada');
        }

        const plantilla = preFetchedData?.plantilla || await (async () => {
            const capAny = capacitacion as any;
            if (!capAny.plantillaId) throw new Error('La capacitación no tiene una plantilla asignada');
            const p = await this.plantillaRepository.findById(capAny.plantillaId);
            if (!p) throw new NotFoundError(`Plantilla ID=${capAny.plantillaId} no encontrada`);
            return p;
        })();

        // 2. Prepare content
        const data = this.prepareCertificateData({ ...usuario, rolCapacitacion: inscripcion.rolCapacitacion }, capacitacion);
        const config = plantilla.configuracion || {};
        const hash = crypto.randomBytes(12).toString('hex');

        // Verification URL
        const baseUrl = env.FRONTEND_URL.endsWith('/') ? env.FRONTEND_URL.slice(0, -1) : env.FRONTEND_URL;
        const qrCodeUrl = `${baseUrl}/validar-certificados?hash=${hash}`;

        // 3. Output Path
        const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR || 'public/uploads');
        let certificatesDir = path.join(uploadDir, 'certificados');
        let isUsingTmp = false;

        try {
            if (!fs.existsSync(certificatesDir)) {
                fs.mkdirSync(certificatesDir, { recursive: true });
            }
        } catch (e) {
            certificatesDir = os.tmpdir();
            isUsingTmp = true;
        }

        const fileName = `cert_${usuarioId}_${capacitacionId}_${hash.substring(0, 8)}.pdf`;
        const outputPath = path.join(certificatesDir, fileName);

        // 4. Handle Dynamic Signatures
        let finalFirmas = (plantilla.configuracion as any)?.firmas || [];
        
        // 4.1 Check if there's any dynamic signature placeholder
        const containsDynamicFirma = finalFirmas.some((f: any) => f.id && f.id.startsWith('dynamic_expositor_'));
        
        if (containsDynamicFirma) {
            logger.info(`[GEN_CERT] Buscando firmas dinámicas para Cap=${capacitacionId}...`);
            const todasInscripciones = await this.usuarioCapacitacionRepository.findByCapacitacionId(capacitacionId);
            const expositores = todasInscripciones.filter((i: any) => i.rolCapacitacion === 'Expositor' && i.usuario?.firmaUrl);
            
            logger.info(`[GEN_CERT] Encontrados ${expositores.length} expositores con firma.`);

            finalFirmas = finalFirmas.map((f: any) => {
                if (f.id && f.id.startsWith('dynamic_expositor_')) {
                    // Map dynamic_expositor_1 to the 1st expositor, dynamic_expositor_2 to 2nd, etc.
                    const index = parseInt(f.id.split('_').pop() || '1') - 1;
                    const expositor = expositores[index];

                    if (expositor && expositor.usuario) {
                        const u = expositor.usuario;
                        const fullName = [u.primerNombre, u.primerApellido]
                            .filter(Boolean)
                            .join(' ')
                            .toUpperCase() || u.nombre.toUpperCase();

                        return {
                            ...f,
                            nombrePersona: fullName,
                            cargo: 'EXPOSITOR',
                            imagenUrl: u.firmaUrl
                        };
                    } else {
                        // Fallback: Si no hay expositor para este slot, lo dejamos como está
                        return f;
                    }
                }
                return f;
            });
        }

        // 4. Generate PDF
        try {
            await this.generatorService.generate(
                plantilla.imagenUrl || '',
                config as any,
                data,
                qrCodeUrl,
                outputPath,
                finalFirmas,
                preFetchedData?.backgroundBuffer
            );
        } catch (genErr) {
            logger.error(`[GEN_CERT] Error en generatorService.generate: ${genErr}`);
            throw genErr;
        }

        // 5. Save in DB
        const publicUrl = isUsingTmp ? `/tmp/${fileName}` : `/uploads/certificados/${fileName}`;
        
        try {
            // Borramos TODOS los duplicados previos (por si ya existen varios)
            await this.certificadoRepository.deleteByUserAndCapacitacion(usuarioId, capacitacionId);

            await this.certificadoRepository.create({
                usuarioId,
                capacitacionId,
                codigoQR: hash,
                pdfUrl: publicUrl
            });
            logger.info(`[GEN_CERT] Certificado registrado/actualizado en DB. URL: ${publicUrl}`);
        } catch (dbErr) {
            logger.error(`[GEN_CERT] Error guardando registro en DB: ${dbErr}`);
        }

        // 6. Send Email (Async)
        if (usuario.email) {
            logger.info(`[GEN_CERT] Enviando correo a ${usuario.email}...`);
            this.emailService.sendCertificateEmail(
                usuario.email,
                data.usuario,
                capacitacion.nombre,
                outputPath
            ).then(() => {
                logger.info(`[GEN_CERT] Correo enviado exitosamente a ${usuario.email}`);
                // Opcional: Si usamos /tmp, borrar el archivo después de enviar el correo
                if (isUsingTmp && fs.existsSync(outputPath)) {
                    // fs.unlinkSync(outputPath); // Desactivado por ahora para evitar problemas si es asíncrono
                }
            }).catch(err => {
                logger.error(`[GEN_CERT] Error enviando correo a ${usuario.email}: ${err}`);
            });
        }


        return publicUrl;
    }
}
