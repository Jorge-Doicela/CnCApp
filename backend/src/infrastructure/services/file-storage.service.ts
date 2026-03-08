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
            // No es base64, tal vez es una URL externa, devolver tal cual
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

        // 4. Retornar URL pública
        const relativePath = subfolder ? `uploads/${subfolder}/${fileName}` : `uploads/${fileName}`;
        // Ensure env.BASE_URL exists and handle trailing slash
        const baseUrl = env.BASE_URL.endsWith('/') ? env.BASE_URL.slice(0, -1) : env.BASE_URL;
        return `${baseUrl}/${relativePath}`;
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

            const relativePath = parts[1];
            const filePath = path.join(this.uploadDir, relativePath);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('[FILE_STORAGE] Error deleting file:', error);
        }
    }
}
