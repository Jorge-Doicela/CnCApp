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
            },
            tls: {
                // Necesario para algunos servidores de Office 365 y entornos locales
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            }
        });
        
        // Verificar conexión al inicio (opcional, ayuda al debug)
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('[EMAIL_SERVICE] Error de configuración SMTP:', error);
            } else {
                console.log('[EMAIL_SERVICE] Servidor de correo listo para enviar mensajes');
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
            console.log(`[EMAIL_SERVICE] Intentando enviar correo de confirmación a ${to}...`);
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`[EMAIL_SERVICE] Correo de confirmación enviado exitosamente a ${to}. ID: ${info.messageId}`);
        } catch (error: any) {
            console.error(`[EMAIL_SERVICE] Error crítico enviando correo de confirmación a ${to}:`, error.message);
            if (error.code === 'EAUTH') {
                console.error('[EMAIL_SERVICE] Error de autenticación: Verifica SMTP_USER y SMTP_PASS. En Office 365 asegúrate de que SMTP AUTH esté habilitado para esta cuenta.');
            }
        }
    }

    async sendCertificateEmail(to: string, userName: string, courseName: string, filePath: string): Promise<void> {
        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.warn(`[EMAIL_MOCK] Credenciales ausentes. Simulación de envío de certificado a ${to} (${courseName})`);
            return;
        }

        const mailOptions = {
            from: `"Consejo Nacional de Competencias" <${env.SMTP_USER}>`,
            to,
            subject: `🎓 ¡Certificado Disponible! - ${courseName}`,
            html: `
                <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
                        <div style="margin-bottom: 20px; opacity: 0.9;">
                             <img src="https://capacitacion.competencias.gob.ec/assets/img/logo-white.png" alt="CNC Logo" style="height: 50px; width: auto;" onerror="this.style.display='none'">
                        </div>
                        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">¡FELICIDADES POR TU LOGRO!</h1>
                        <p style="margin: 10px 0 0; opacity: 0.8; font-size: 16px;">Has completado exitosamente tu capacitación</p>
                    </div>
                    
                    <div style="padding: 40px 30px; color: #334155;">
                        <p style="font-size: 18px; margin-top: 0;">Estimado(a) <strong>${userName}</strong>,</p>
                        <p style="font-size: 16px; line-height: 1.6;">Es un honor para el <strong>Consejo Nacional de Competencias</strong> informarte que tu certificado por completar la capacitación:</p>
                        
                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #6366f1; margin: 25px 0;">
                            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">${courseName}</p>
                            <p style="margin: 5px 0 0; font-size: 14px; color: #64748b;">Emitido el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>

                        <p style="font-size: 16px; line-height: 1.6;">Adjunto a este correo encontrarás el documento oficial en formato PDF. Este certificado cuenta con un <strong>código QR de verificación único</strong> que garantiza su validez legal y académica a nivel nacional.</p>
                        
                        <div style="margin: 35px 0; text-align: center;">
                            <p style="font-size: 14px; color: #94a3b8; margin-bottom: 15px;">¿No puedes ver el adjunto? También puedes descargarlo desde tu perfil:</p>
                            <a href="${env.FRONTEND_URL}/perfil/certificados" style="background-color: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                                Ir a mis Certificados
                            </a>
                        </div>
                    </div>
                    
                    <div style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                            Este es un mensaje automático generado por el Sistema de Capacitaciones del CNC.<br>
                            © ${new Date().getFullYear()} Consejo Nacional de Competencias. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `Certificado_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
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

    async sendTestEmail(to: string): Promise<void> {
        const mailOptions = {
            from: `"Prueba de Sistema" <${env.SMTP_USER}>`,
            to,
            subject: 'Prueba de Conexión SMTP - Sistema CNC',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #003366;">Prueba de Conexión Exitosa</h2>
                    <p>Este es un correo de prueba enviado desde el <strong>Sistema CNC</strong>.</p>
                    <p>Si estás recibiendo esto, significa que la configuración SMTP es correcta.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Fecha y hora del envío: ${new Date().toLocaleString()}</p>
                </div>
            `
        };

        try {
            console.log(`[EMAIL_SERVICE] Enviando correo de PRUEBA a ${to}...`);
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`[EMAIL_SERVICE] Prueba enviada exitosamente. ID: ${info.messageId}`);
        } catch (error: any) {
            console.error(`[EMAIL_SERVICE] Falló la prueba de envío a ${to}:`, error.message);
            throw error;
        }
    }
}
