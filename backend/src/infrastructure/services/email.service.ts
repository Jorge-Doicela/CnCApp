import { injectable } from 'tsyringe';
import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import logger from '../../config/logger';

@injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(env.SMTP_PORT || '465', 10),
            secure: env.SMTP_SECURE !== 'false',
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS
            }
        });
    }

    async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.warn(`[EMAIL_MOCK] Credentials missing in .env. Would send to ${to}: ${resetLink}`);
            return;
        }

        const mailOptions = {
            from: `"Soporte CNC" <${env.SMTP_USER}>`,
            to,
            subject: 'Recuperación de Contraseña - Sistema CNC',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #003366; margin: 0;">Recuperación de Contraseña</h2>
                    </div>
                    <p style="font-size: 16px;">Hola,</p>
                    <p style="font-size: 16px;">Hemos recibido una solicitud para cambiar tu contraseña en el Sistema CNC.</p>
                    <p style="font-size: 16px;">Si fuiste tú, haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #003366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Restablecer Contraseña
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">Este enlace es único y expirará en poco tiempo por tu seguridad.</p>
                    <p style="font-size: 14px; color: #666;">Si no solicitaste este cambio, puedes ignorar de forma segura este correo. Tu cuenta seguirá protegida.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">Atentamente,<br>El Equipo del Sistema CNC</p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`[EMAIL_SERVICE] Correo de recuperación enviado a ${to}`);
        } catch (error) {
            console.error(`[EMAIL_SERVICE] Falló el envío de correo a ${to}:`, error);
        }
    }

    async sendAccountConfirmationEmail(to: string, confirmLink: string, nombreCompleto: string): Promise<void> {
        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.warn(`[EMAIL_MOCK] Configuración SMTP incompleta. Correo de confirmación simulado hacia ${to}: ${confirmLink}`);
            return;
        }

        const mailOptions = {
            from: `"Bienvenido a CNC" <${env.SMTP_USER}>`,
            to,
            subject: 'Activa tu Cuenta - Sistema CNC',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #003366; margin: 0;">¡Bienvenido al sistema!</h2>
                    </div>
                    <p style="font-size: 16px;">Hola <strong>${nombreCompleto}</strong>,</p>
                    <p style="font-size: 16px;">Tu cuenta ha sido creada exitosamente. Para poder iniciar sesión, necesitas confirmar que este correo te pertenece.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${confirmLink}" style="background-color: #003366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Confirmar mi Correo
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">Atentamente,<br>El Equipo del Consejo Nacional de Competencias</p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`[EMAIL_SERVICE] Correo de confirmación enviado a ${to}`);
        } catch (error) {
            console.error(`[EMAIL_SERVICE] Error enviando correo de confirmación a ${to}:`, error);
        }
    }

    async sendCertificateEmail(to: string, userName: string, courseName: string, filePath: string): Promise<void> {
        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.warn(`[EMAIL_MOCK] Credenciales ausentes. Simulación de envío de certificado a ${to} (${courseName})`);
            return;
        }

        const mailOptions = {
            from: `"Capacitaciones CNC" <${env.SMTP_USER}>`,
            to,
            subject: `¡Certificado Disponible! - ${courseName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #003366; margin: 0;">¡Felicidades por tu Logro!</h2>
                    </div>
                    <p style="font-size: 16px;">Hola <strong>${userName}</strong>,</p>
                    <p style="font-size: 16px;">Has completado exitosamente la capacitación: <strong>${courseName}</strong>.</p>
                    <p style="font-size: 16px;">Adjunto a este correo encontrarás tu certificado digital validado por el Consejo Nacional de Competencias.</p>
                    
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #003366;">
                        <p style="margin: 0; font-size: 14px; color: #475569;">
                            Este certificado cuenta con un código QR de verificación único que garantiza su autenticidad.
                        </p>
                    </div>

                    <p style="font-size: 14px; color: #666;">También puedes descargarlo en cualquier momento desde tu perfil en la plataforma.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">Atentamente,<br>El Equipo de Capacitaciones CNC</p>
                </div>
            `,
            attachments: [
                {
                    filename: `Certificado_${courseName.replace(/[^a-zA-Z0-0]/g, '_')}.pdf`,
                    path: filePath
                }
            ]
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`[EMAIL_SERVICE] Certificado enviado exitosamente a ${to}`);
        } catch (error) {
            console.error(`[EMAIL_SERVICE] Fallo en el envío de certificado a ${to}:`, error);
        }
    }
}
