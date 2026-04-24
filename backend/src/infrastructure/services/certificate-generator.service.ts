import PDFDocument = require('pdfkit');
import * as QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { injectable } from 'tsyringe';
import { env } from '../../config/env';
import logger from '../../config/logger';

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
    textoTemplate?: string;
}

interface FirmaConfig {
    id: string;
    nombrePersona: string;
    cargo: string;
    institucion?: string;
    imagenUrl: string; // Base64 or URL
    x: number;
    y: number;
    width: number;
    height: number;
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
        outputPath: string,
        firmas?: FirmaConfig[],
        backgroundImgBuffer?: Buffer
    ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
                const stream = fs.createWriteStream(outputPath);
                doc.pipe(stream);

                this.registerFonts(doc);

                // 2. Load Background Image
                if (backgroundImgBuffer) {
                    doc.image(backgroundImgBuffer, 0, 0, { width: doc.page.width, height: doc.page.height });
                } else {
                    await this.renderBackground(doc, plantillaImagenUrl);
                }

                // 3. Draw Text Fields
                for (const [key, fieldConfig] of Object.entries(config)) {
                    if (key === 'codigoQR') continue;

                    let text = data[key];
                    if (fieldConfig.textoTemplate) {
                        text = fieldConfig.textoTemplate;
                        for (const [dataKey, dataValue] of Object.entries(data)) {
                            const placeholder = `{{${dataKey}}}`;
                            text = text.replace(new RegExp(placeholder, 'g'), dataValue || '');
                        }
                    }

                    if (text && fieldConfig) {
                        this.renderRichText(doc, text, fieldConfig);
                    }
                }

                // 4. Draw Signatures
                if (firmas && firmas.length > 0) {
                    for (const firma of firmas) {
                        await this.renderFirma(doc, firma);
                    }
                }

                // 5. Generate and Draw QR Code
                await this.renderQRCode(doc, qrCodeContent, config['codigoQR']);

                doc.end();

                stream.on('finish', () => resolve());
                stream.on('error', (err) => reject(err));

            } catch (error) {
                reject(error);
            }
        });
    }

    private registerFonts(doc: PDFKit.PDFDocument) {
        const fontsDir = path.join(process.cwd(), 'public', 'fonts');
        const fontFiles = [
            { name: 'Montserrat', file: 'Montserrat-Regular.ttf' },
            { name: 'Montserrat-Bold', file: 'Montserrat-Bold.ttf' },
            { name: 'PlayfairDisplay', file: 'PlayfairDisplay-Regular.ttf' },
            { name: 'GreatVibes', file: 'GreatVibes-Regular.ttf' },
            { name: 'Poppins', file: 'Poppins-Regular.ttf' },
            { name: 'Poppins-Bold', file: 'Poppins-Bold.ttf' },
            { name: 'Inter', file: 'Inter-Regular.ttf' },
            { name: 'Inter-Bold', file: 'Inter-Bold.ttf' }
        ];

        for (const font of fontFiles) {
            const fontPath = path.join(fontsDir, font.file);
            if (fs.existsSync(fontPath)) {
                doc.registerFont(font.name, fontPath);
            }
        }

        if (!fs.existsSync(path.join(fontsDir, 'Inter-Bold.ttf')) && fs.existsSync(path.join(fontsDir, 'Poppins-Bold.ttf'))) {
            doc.registerFont('Inter-Bold', path.join(fontsDir, 'Poppins-Bold.ttf'));
        }
        if (!fs.existsSync(path.join(fontsDir, 'Inter-Regular.ttf')) && fs.existsSync(path.join(fontsDir, 'Poppins-Regular.ttf'))) {
            doc.registerFont('Inter', path.join(fontsDir, 'Poppins-Regular.ttf'));
        }
    }

    /**
     * Resuelve una URL o ruta a una ruta de archivo local si es posible.
     * Si la URL apunta a nuestro propio servidor (según env.BASE_URL), la convierte a ruta de disco.
     */    private resolveLocalPath(url: string): string | null {
        if (!url) return null;

        // Caso 1: Es una ruta relativa (empieza con /uploads)
        if (url.startsWith('/uploads/')) {
            // Buscamos en la raíz del proyecto, NO dentro de public
            return path.join(process.cwd(), url);
        }

        // Caso 2: Es una URL absoluta que apunta a nuestro servidor
        const baseUrl = env.BASE_URL.endsWith('/') ? env.BASE_URL.slice(0, -1) : env.BASE_URL;
        if (url.startsWith(baseUrl)) {
            const relativePath = url.replace(baseUrl, '');
            // Si la ruta contiene /uploads/, resolver desde la raíz del proyecto
            if (relativePath.includes('/uploads/')) {
                return path.join(process.cwd(), relativePath);
            }
            // Otros archivos estáticos en public
            return path.join(process.cwd(), 'public', relativePath);
        }

        // Caso 3: Es una ruta de sistema de archivos (absoluta o relativa al root)
        if (!url.startsWith('http') && !url.startsWith('data:')) {
            return path.isAbsolute(url) ? url : path.join(process.cwd(), url);
        }

        return null;
    }

    /**
     * Realiza un fetch con timeout para evitar bloqueos infinitos
     */
    private async fetchWithTimeout(url: string, timeoutMs: number = 8000): Promise<Response> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(id);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    async fetchImageBuffer(url: string): Promise<Buffer | null> {
        try {
            return await this.fetchBuffer(url);
        } catch (e) {
            logger.error(`[CERT_GEN] Error pre-fetching image buffer (${url}):`, e);
            return null;
        }
    }

    private async fetchBuffer(url: string): Promise<Buffer | null> {
        if (!url) return null;

        // Data URL
        if (url.startsWith('data:image')) {
            const base64Data = url.split(',')[1];
            return Buffer.from(base64Data, 'base64');
        }

        // Local Path
        const localPath = this.resolveLocalPath(url);
        if (localPath && fs.existsSync(localPath)) {
            return fs.readFileSync(localPath);
        }

        // Remote URL
        if (url.startsWith('http')) {
            const response = await this.fetchWithTimeout(url);
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        }

        return null;
    }

    private async renderBackground(doc: PDFKit.PDFDocument, url: string) {
        try {
            const buffer = await this.fetchBuffer(url);
            if (buffer) {
                doc.image(buffer, 0, 0, { width: doc.page.width, height: doc.page.height });
            } else {
                // FALLBACK: Blanco si no hay imagen
                doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
            }
        } catch (e) {
            logger.error(`[CERT_GEN] Error renderBackground (${url}):`, e);
            // FALLBACK: Blanco si falla la carga
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
        }
    }

    private renderRichText(doc: PDFKit.PDFDocument, text: string, config: FieldConfig) {
        const baseFont = config.fontFamily || 'Montserrat';
        const boldFont = baseFont.includes('Bold') ? baseFont : `${baseFont}-Bold`;
        
        doc.fillColor(config.color || '#1e293b').fontSize(config.fontSize || 12);

        // Use provided width or default to a reasonable value for centering if not specified
        const renderWidth = config.width || 500;
        
        doc.fillColor(config.color || '#1e293b').fontSize(config.fontSize || 12);

        const options: PDFKit.Mixins.TextOptions = {
            width: renderWidth,
            align: (config.textAlign as any) || 'center',
            lineGap: 2
        };

        // Match frontend's "transform: translate(-50%, -50%)"
        // Calculate text height to center vertically
        const cleanText = text.replace(/<b>|<\/b>/g, '');
        const totalHeight = doc.heightOfString(cleanText, options);
        
        const renderX = config.x - (renderWidth / 2);
        const renderY = config.y - (totalHeight / 2);

        // Reset cursor to the calculated start position
        doc.text('', renderX, renderY, options);

        // Simple parser for <b> tags with support for mixed styles in the same block
        const parts = text.split(/(<b>.*?<\/b>)/g);
        
        parts.forEach((part, index) => {
            const isBold = part.startsWith('<b>') && part.endsWith('</b>');
            const content = isBold ? part.slice(3, -4) : part;
            
            if (!content) return;

            // Apply font style
            try {
                doc.font(isBold ? boldFont : baseFont);
            } catch (e) {
                // Fallback to default if custom font fails
                doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica');
            }

            const isLast = index === parts.length - 1;
            doc.text(content, {
                continued: !isLast,
                ...options
            });
        });
    }

    private async renderFirma(doc: PDFKit.PDFDocument, firma: FirmaConfig) {
        try {
            let imgSource: any;

            if (firma.imagenUrl.startsWith('data:image')) {
                imgSource = firma.imagenUrl;
            } else {
                // Intentar resolución local primero
                const localPath = this.resolveLocalPath(firma.imagenUrl);
                if (localPath && fs.existsSync(localPath)) {
                    imgSource = localPath;
                } else if (firma.imagenUrl.startsWith('http')) {
                    // Si falla local y es URL, fetch con timeout
                    const resp = await this.fetchWithTimeout(firma.imagenUrl);
                    imgSource = Buffer.from(await resp.arrayBuffer());
                }
            }

            if (imgSource) {
                // Signature image - Matches frontend's "transform: translateX(-50%)"
                doc.image(imgSource, firma.x - (firma.width / 2), firma.y, {
                    width: firma.width
                });
            } else {
                console.warn(`[CERT_GEN] No se pudo cargar imagen de firma para: ${firma.nombrePersona}`);
            }

            // Line and Text - Centered on firma.x
            const lineY = firma.y + firma.height - 15;
            doc.moveTo(firma.x - (firma.width / 2.2), lineY)
               .lineTo(firma.x + (firma.width / 2.2), lineY)
               .lineWidth(0.5)
               .stroke('#333333');

            doc.fillColor('#1e293b')
               .font('Inter-Bold')
               .fontSize(9)
               .text(firma.nombrePersona, firma.x - (firma.width / 2), lineY + 4, {
                   width: firma.width,
                   align: 'center'
               });

            doc.fillColor('#475569')
               .font('Inter')
               .fontSize(8)
               .text(firma.cargo, {
                   width: firma.width,
                   align: 'center'
               });

            if (firma.institucion) {
                doc.fillColor('#64748b')
                   .fontSize(7)
                   .text(firma.institucion, {
                       width: firma.width,
                       align: 'center'
                   });
            }
        } catch (e) {
            console.error('Error rendering firma:', e);
        }
    }

    private async renderQRCode(doc: PDFKit.PDFDocument, content: string, qrConfig?: FieldConfig) {
        try {
            const qrBuffer = await QRCode.toBuffer(content, { margin: 1 });
            let size = qrConfig?.fontSize || 100;
            // QR Matches frontend's "transform: translate(-50%, -50%)"
            let x = qrConfig ? qrConfig.x - (size / 2) : doc.page.width - size - 50;
            let y = qrConfig ? qrConfig.y - (size / 2) : doc.page.height - size - 50;

            doc.image(qrBuffer, x, y, { fit: [size, size] });

            // Extract hash from content URL to show it as text
            const hashMatch = content.match(/hash=([a-f0-9]+)/i);
            const hash = hashMatch ? hashMatch[1] : null;

            if (hash) {
                doc.fillColor('#64748b')
                   .font('Inter')
                   .fontSize(7)
                   .text(`CÓDIGO DE VERIFICACIÓN: ${hash.toUpperCase()}`, x, y + size + 2, {
                       width: size,
                       align: 'center'
                   });
            }
        } catch (e) {
            console.error('Error rendering QR:', e);
        }
    }
}
