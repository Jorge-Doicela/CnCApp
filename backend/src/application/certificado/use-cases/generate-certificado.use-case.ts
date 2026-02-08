import { injectable, inject } from 'tsyringe';
import { CertificadoRepository } from '../../../domain/certificado/repositories/certificado.repository';
import { Certificado } from '../../../domain/certificado/entities/certificado.entity';
import { CertificateGeneratorService } from '../../../infrastructure/services/certificate-generator.service';
import { UserRepository } from '../../../domain/user/user.repository';
import { CapacitacionRepository } from '../../../domain/capacitacion/repositories/capacitacion.repository';
import path from 'path';
import fs from 'fs';

@injectable()
export class GenerateCertificadoUseCase {
    constructor(
        @inject('CertificadoRepository') private certificadoRepository: CertificadoRepository,
        @inject(CertificateGeneratorService) private generatorService: CertificateGeneratorService,
        @inject('UserRepository') private userRepository: UserRepository,
        @inject('CapacitacionRepository') private capacitacionRepository: CapacitacionRepository
    ) { }

    async execute(usuarioId: number, capacitacionId: number): Promise<Certificado> {
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
            rol: 'PARTICIPANTE',
            horas: '40 HORAS' // This could be dynamic from capacitacion.duracion
        };

        // 4. Generate QR Content
        const qrCode = `https://cnc-app.com/verify?u=${usuarioId}&c=${capacitacionId}&t=${Date.now()}`;

        // 5. Define Output Path
        const fileName = `cert_${usuarioId}_${capacitacionId}_${Date.now()}.pdf`;
        const publicDir = path.join(process.cwd(), 'public', 'certificados');

        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        const outputPath = path.join(publicDir, fileName);

        // 6. Generate PDF
        await this.generatorService.generate(
            plantilla.imagenUrl || '',
            config,
            data,
            qrCode,
            outputPath
        );

        // 7. Save Record
        return this.certificadoRepository.create({
            usuarioId,
            capacitacionId,
            codigoQR: qrCode,
            pdfUrl: `/certificados/${fileName}`
        });
    }
}
