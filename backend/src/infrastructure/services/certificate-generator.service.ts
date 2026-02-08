import PDFDocument = require('pdfkit');
import * as QRCode from 'qrcode';
import fs from 'fs';
import { injectable } from 'tsyringe';

interface CertificateData {
    nombreParticipante: string;
    nombreCurso: string;
    fechaEmision: string; // Formatted date string
    cedula?: string;
    rol?: string;
    horas?: string;
    // Add other fields as needed based on Plantilla config
    [key: string]: string | undefined;
}

interface FieldConfig {
    x: number;
    y: number;
    fontSize: number;
    color: string;
}

interface PlantillaConfig {
    [key: string]: FieldConfig;
}

@injectable()
export class CertificateGeneratorService {
    // Default font if custom not found (PDFKit has built-in fonts)

    async generate(
        plantillaImagenUrl: string, // Local path or URL? Assuming local path for now or need to download
        config: PlantillaConfig,
        data: CertificateData,
        qrCodeContent: string,
        outputPath: string
    ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                // 1. Create PDF Document (Landscape usually for certificates)
                const doc = new PDFDocument({
                    size: 'A4',
                    layout: 'landscape',
                    margin: 0
                });

                const stream = fs.createWriteStream(outputPath);
                doc.pipe(stream);

                // 2. Load Background Image
                // We need to handle if imagenUrl is a remote URL or local path.
                // For simplified MVP, assuming it's a local path or we download it first. 
                // In production, might be stored in 'uploads/'

                // If it starts with http, we might need to fetch it separately, 
                // but PDFKit supports some image types. Safest is local file.
                // Assuming the Controller resolves the path to a local file.
                // 2. Load Background Image
                if (plantillaImagenUrl.startsWith('data:image')) {
                    doc.image(plantillaImagenUrl, 0, 0, {
                        width: doc.page.width,
                        height: doc.page.height
                    });
                } else if (fs.existsSync(plantillaImagenUrl)) {
                    doc.image(plantillaImagenUrl, 0, 0, {
                        width: doc.page.width,
                        height: doc.page.height
                    });
                } else {
                    console.warn(`Plantilla image not found at ${plantillaImagenUrl}`);
                    // Draw a placeholder or minimal border
                    doc.rect(0, 0, doc.page.width, doc.page.height).stroke();
                    doc.text('Plantilla background missing', 100, 100);
                }

                // 3. Draw Text Fields
                for (const [key, fieldConfig] of Object.entries(config)) {
                    const text = data[key];
                    if (text && fieldConfig) {
                        doc.fillColor(fieldConfig.color || '#000000')
                            .fontSize(fieldConfig.fontSize || 12)
                            .text(text, fieldConfig.x, fieldConfig.y);
                    }
                }

                // 4. Generate and Draw QR Code
                // Position for QR (Could be configurable in future, fixed for now or part of config?)
                // Let's check if 'qr' is in config, otherwise default bottom-right
                // But usually config comes from Plantilla definition.

                // Let's generate a temporary buffer for QR
                const qrBuffer = await QRCode.toBuffer(qrCodeContent);

                // Check if 'qr' position is defined in config, else default
                // Assuming 'qr' might be a key in config? 
                // If not, hardcode position for now or add to Plantilla model later.
                // Defaulting to bottom-right corner
                const qrSize = 100;
                const qrX = doc.page.width - qrSize - 50;
                const qrY = doc.page.height - qrSize - 50;

                doc.image(qrBuffer, qrX, qrY, { fit: [qrSize, qrSize] });

                // 5. Finalize
                doc.end();

                stream.on('finish', () => resolve());
                stream.on('error', (err) => reject(err));

            } catch (error) {
                reject(error);
            }
        });
    }
}
