import { injectable, inject } from 'tsyringe';
import { CertificadoRepository } from '../../../domain/certificado/repositories/certificado.repository';
import { Certificado } from '../../../domain/certificado/entities/certificado.entity';
import { CertificateGeneratorService } from '../../../infrastructure/services/certificate-generator.service';
import { UserRepository } from '../../../domain/user/user.repository';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';
import { env } from '../../../config/env';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { UsuarioCapacitacionRepository } from '../../../domain/usuario-capacitacion/usuario-capacitacion.repository';

@injectable()
export class GenerateCertificadoUseCase {
    constructor(
        @inject('CertificadoRepository') private certificadoRepository: CertificadoRepository,
        @inject(CertificateGeneratorService) private generatorService: CertificateGeneratorService,
        @inject('UserRepository') private userRepository: UserRepository,
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository,
        @inject('UsuarioCapacitacionRepository') private usuarioCapacitacionRepository: UsuarioCapacitacionRepository
    ) { }

    async execute(usuarioId: number, capacitacionId: number): Promise<Certificado> {
        // 0. Check if certificate already exists to avoid duplicates
        const existing = await this.certificadoRepository.findByUserAndCapacitacion(usuarioId, capacitacionId);
        if (existing) {
            return existing;
        }
        
        // 0.5 Check Attendance
        const inscripcion = await this.usuarioCapacitacionRepository.findByUserAndCapacitacion(usuarioId, capacitacionId);
        if (!inscripcion) throw new Error('El usuario no está inscrito en esta capacitación');
        if (!inscripcion.asistio) throw new Error('El usuario no marcó asistencia en esta capacitación');

        // 1. Fetch User and Capacitacion
        const usuario = await this.userRepository.findById(usuarioId);
        if (!usuario) throw new Error('Usuario no encontrado');

        const capacitacion = await this.capacitacionRepository.findById(capacitacionId);
        if (!capacitacion) throw new Error('Capacitación no encontrada');

        // Cast to any to access plantilla check in case type definition is strict
        const capAny = capacitacion as any;
        if (!capAny.plantillaId && !capAny.plantilla) {
            throw new Error('La capacitación no tiene una plantilla asignada');
        }

        // 2. Resolve Plantilla
        // If repository 'findById' includes 'plantilla', we are good. 
        // If not, we might fail here. Assuming it is included for now.
        if (!capAny.plantilla) {
            // In a robust system, we would fetch simple plantilla by ID here if missing
            throw new Error('Datos de plantilla no cargados en capacitación. Asegúrate de incluir la relación en el repositorio.');
        }

        const plantilla = capAny.plantilla;

        // 3. Prepare config and data
        const config = plantilla.configuracion || {};
        const data: any = {
            nombreUsuario: `${usuario.primerNombre || ''} ${usuario.primerApellido || ''}`.trim().toUpperCase() || usuario.nombre.toUpperCase(),
            curso: capacitacion.nombre.toUpperCase(),
            fecha: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
            cedula: usuario.ci,
            rol: (inscripcion.rolCapacitacion || 'Participante').toUpperCase(),
            horas: `${capacitacion.horas || 0} HORAS`
        };

        // 4. Generate Unique Hash and QR Content
        const hash = crypto.randomBytes(12).toString('hex'); // 24 chars, very unique
        
        // Base URL for verification
        const baseUrl = env.FRONTEND_URL.endsWith('/') ? env.FRONTEND_URL.slice(0, -1) : env.FRONTEND_URL;
        const qrCodeUrl = `${baseUrl}/validar-certificados?hash=${hash}`;

        // 5. Define Output Path
        const fileName = `cert_${usuarioId}_${capacitacionId}_${hash.substring(0, 8)}.pdf`;
        const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR || 'public/uploads');
        const certificatesDir = path.join(uploadDir, 'certificados');

        if (!fs.existsSync(certificatesDir)) {
            fs.mkdirSync(certificatesDir, { recursive: true });
        }
        const outputPath = path.join(certificatesDir, fileName);

        // 6. Generate PDF
        await this.generatorService.generate(
            plantilla.imagenUrl || '',
            config,
            data,
            qrCodeUrl, // Physical QR code has full URL
            outputPath
        );

        // 7. Save Record
        return this.certificadoRepository.create({
            usuarioId,
            capacitacionId,
            codigoQR: hash, // Store only hash for cleaner lookup
            pdfUrl: `/uploads/certificados/${fileName}`
        });
    }
}
