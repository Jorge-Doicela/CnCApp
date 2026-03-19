import PDFDocument = require('pdfkit');
import * as QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
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
    fontFamily?: string;
    width?: number; // Optional wrapping width
    textAlign?: string; // Optional alignment
    isUnderline?: boolean;
}

interface PlantillaConfig {
    [key: string]: FieldConfig;
}

@injectable()
export class CertificateGeneratorService {
    // Default font if custom not found (PDFKit has built-in fonts)

    async generate(
        plantillaImagenUrl: string, 
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

                // 1.5 Register Custom Fonts
                const fontsDir = path.join(process.cwd(), 'public', 'fonts');
                if (fs.existsSync(path.join(fontsDir, 'Montserrat-Regular.ttf'))) {
                    doc.registerFont('Montserrat', path.join(fontsDir, 'Montserrat-Regular.ttf'));
                }
                if (fs.existsSync(path.join(fontsDir, 'Montserrat-Bold.ttf'))) {
                    doc.registerFont('Montserrat-Bold', path.join(fontsDir, 'Montserrat-Bold.ttf'));
                }
                if (fs.existsSync(path.join(fontsDir, 'PlayfairDisplay-Regular.ttf'))) {
                    doc.registerFont('PlayfairDisplay', path.join(fontsDir, 'PlayfairDisplay-Regular.ttf'));
                }
                if (fs.existsSync(path.join(fontsDir, 'GreatVibes-Regular.ttf'))) {
                    doc.registerFont('GreatVibes', path.join(fontsDir, 'GreatVibes-Regular.ttf'));
                }
                if (fs.existsSync(path.join(fontsDir, 'Poppins-Regular.ttf'))) {
                    doc.registerFont('Poppins', path.join(fontsDir, 'Poppins-Regular.ttf'));
                }
                if (fs.existsSync(path.join(fontsDir, 'Poppins-Bold.ttf'))) {
                    doc.registerFont('Poppins-Bold', path.join(fontsDir, 'Poppins-Bold.ttf'));
                }
                if (fs.existsSync(path.join(fontsDir, 'Inter-Bold.ttf'))) {
                    doc.registerFont('Inter-Bold', path.join(fontsDir, 'Inter-Bold.ttf'));
                } else if (fs.existsSync(path.join(fontsDir, 'Poppins-Bold.ttf'))) {
                    doc.registerFont('Inter-Bold', path.join(fontsDir, 'Poppins-Bold.ttf'));
                }
                
                if (fs.existsSync(path.join(fontsDir, 'Inter-Regular.ttf'))) {
                    doc.registerFont('Inter', path.join(fontsDir, 'Inter-Regular.ttf'));
                } else if (fs.existsSync(path.join(fontsDir, 'Poppins-Regular.ttf'))) {
                    doc.registerFont('Inter', path.join(fontsDir, 'Poppins-Regular.ttf'));
                }

                // 2. Load Background Image
                if (plantillaImagenUrl) {
                    if (plantillaImagenUrl.startsWith('data:image')) {
                        doc.image(plantillaImagenUrl, 0, 0, {
                            width: doc.page.width,
                            height: doc.page.height
                        });
                    } else if (plantillaImagenUrl.startsWith('http://') || plantillaImagenUrl.startsWith('https://')) {
                        try {
                            const response = await fetch(plantillaImagenUrl);
                            if (!response.ok) throw new Error(`HTTP fetch status: ${response.status}`);
                            const arrayBuffer = await response.arrayBuffer();
                            doc.image(Buffer.from(arrayBuffer), 0, 0, {
                                width: doc.page.width,
                                height: doc.page.height
                            });
                        } catch (e) {
                            console.warn(`Failed to fetch HTTP image: ${plantillaImagenUrl}`, e);
                            doc.rect(0, 0, doc.page.width, doc.page.height).stroke();
                            doc.fillColor('#000000').fontSize(20).text('Plantilla URL unreachable', 100, 100);
                        }
                    } else {
                        const imagePath = path.isAbsolute(plantillaImagenUrl) 
                            ? plantillaImagenUrl 
                            : path.join(process.cwd(), 'public', plantillaImagenUrl);

                        if (fs.existsSync(imagePath)) {
                            doc.image(imagePath, 0, 0, {
                                width: doc.page.width,
                                height: doc.page.height
                            });
                        } else {
                            console.warn(`Plantilla image not found locally at ${imagePath}`);
                            doc.rect(0, 0, doc.page.width, doc.page.height).stroke();
                            doc.fillColor('#000000').fontSize(20).text('Plantilla background missing', 100, 100);
                        }
                    }
                }

                // 3. Draw Text Fields
                for (const [key, fieldConfig] of Object.entries(config)) {
                    if (key === 'codigoQR') continue; // Don't draw the QR code config as text

                    const text = data[key];
                    if (text && fieldConfig) {
                        try {
                            doc.font(fieldConfig.fontFamily || 'Helvetica');
                        } catch (e) {
                            console.warn(`Font ${fieldConfig.fontFamily} not registered in PDFKit. Falling back to Helvetica.`);
                            doc.font('Helvetica');
                        }

                        doc.fillColor(fieldConfig.color || '#000000')
                           .fontSize(fieldConfig.fontSize || 12);
                        
                        const textOptions: PDFKit.Mixins.TextOptions = {
                            lineBreak: false
                        };

                        if (fieldConfig.width) {
                            textOptions.width = fieldConfig.width;
                            textOptions.lineBreak = true;
                            if (fieldConfig.textAlign) {
                                textOptions.align = fieldConfig.textAlign as any;
                            }
                        }

                        if (fieldConfig.isUnderline) {
                            textOptions.underline = true;
                        }

                        const textHeight = doc.heightOfString(text, textOptions);
                        let renderX = fieldConfig.x;
                        let renderY = fieldConfig.y;

                        if (!fieldConfig.width) {
                            const textWidth = doc.widthOfString(text);
                            if (fieldConfig.textAlign === 'left') {
                                renderY = fieldConfig.y - (textHeight / 2); // Center horizontally aligned left
                            } else if (fieldConfig.textAlign === 'right') {
                                renderX = fieldConfig.x - textWidth;
                                renderY = fieldConfig.y - (textHeight / 2);
                            } else {
                                // Default center
                                renderX = fieldConfig.x - (textWidth / 2);
                                renderY = fieldConfig.y - (textHeight / 2);
                            }
                        } else {
                            // Block is translated -50% -50% in frontend, so X,Y marks the absolute center of the bounding box
                            renderX = fieldConfig.x - (fieldConfig.width / 2);
                            renderY = fieldConfig.y - (textHeight / 2);
                        }

                        doc.text(text, renderX, renderY, textOptions);
                    }
                }

                // 4. Generate and Draw QR Code
                const qrBuffer = await QRCode.toBuffer(qrCodeContent, { margin: 1 });

                let qrSize = 100;
                let qrX = doc.page.width - qrSize - 50;
                let qrY = doc.page.height - qrSize - 50;

                if (config['codigoQR']) {
                    const qrConfig = config['codigoQR'];
                    qrSize = qrConfig.fontSize || 100;
                    // Apply translate(-50%, -50%) offset to match frontend dragging center
                    qrX = qrConfig.x - (qrSize / 2);
                    qrY = qrConfig.y - (qrSize / 2);
                }

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
