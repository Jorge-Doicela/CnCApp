import { injectable } from 'tsyringe';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class FileStorageService {
    private uploadDir: string;

    constructor() {
        this.uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR || 'public/uploads');
        this.ensureDirectoryExists();
    }

    private ensureDirectoryExists() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Saves a base64 string as a file and returns the public URL
     * @param base64Data The base64 string (including data:image/...)
     * @param subfolder Optional subfolder inside uploads (e.g., 'profiles', 'signatures')
     * @returns The relative public URL to the file
     */
    async saveBase64(base64Data: string, subfolder: string = ''): Promise<string> {
        // 1. Validar que es un base64
        const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            // No es base64. Si es una URL absoluta de nuestro servidor, la hacemos relativa
            const baseUrl = env.BASE_URL.endsWith('/') ? env.BASE_URL.slice(0, -1) : env.BASE_URL;
            if (base64Data.startsWith(baseUrl)) {
                return base64Data.replace(baseUrl, '');
            }
            return base64Data;
        }

        const type = matches[1];
        const data = matches[2];
        const extension = type.split('/')[1] || 'png';
        const buffer = Buffer.from(data, 'base64');

        // 2. Definir ruta
        const fileName = `${uuidv4()}.${extension}`;
        const targetDir = subfolder ? path.join(this.uploadDir, subfolder) : this.uploadDir;
        
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, fileName);

        // 3. Guardar archivo
        fs.writeFileSync(filePath, buffer);

        // 4. Retornar URL pública relativa
        const relativePath = subfolder ? `uploads/${subfolder}/${fileName}` : `uploads/${fileName}`;
        return `/${relativePath}`;
    }

    /**
     * Restaura un archivo a partir de su base64 si no existe en disco.
     * @param publicUrl URL relativa del archivo (e.g., /uploads/plantillas/...)
     * @param base64Data Datos base64 originales
     */
    restoreBase64(publicUrl: string, base64Data: string): void {
        if (!publicUrl || !base64Data || !publicUrl.includes('/uploads/')) return;

        try {
            // Extraer la ruta relativa después de 'uploads/'
            const parts = publicUrl.split('/uploads/');
            const relativePath = parts[parts.length - 1];
            const filePath = path.join(this.uploadDir, relativePath);

            if (!fs.existsSync(filePath)) {
                // Limpiar el prefijo data:image/... si existe
                const data = base64Data.includes('base64,') 
                    ? base64Data.split('base64,')[1] 
                    : base64Data;
                
                const buffer = Buffer.from(data, 'base64');
                const targetDir = path.dirname(filePath);
                
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                fs.writeFileSync(filePath, buffer);
                console.log(`[FILE_STORAGE] Archivo restaurado exitosamente: ${filePath}`);
            }
        } catch (error) {
            console.error('[FILE_STORAGE] Error restaurando archivo:', error);
        }
    }

    /**
     * Deletes a file given its public URL
     * @param publicUrl 
     */
    async deleteFile(publicUrl: string): Promise<void> {
        if (!publicUrl || !publicUrl.includes('/uploads/')) return;

        try {
            const parts = publicUrl.split('/uploads/');
            if (parts.length < 2) return;

            const relativePath = parts[parts.length - 1];
            const filePath = path.join(this.uploadDir, relativePath);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('[FILE_STORAGE] Error deleting file:', error);
        }
    }
}
