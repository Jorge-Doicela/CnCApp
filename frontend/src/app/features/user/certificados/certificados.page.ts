import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { addIcons } from 'ionicons';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import {
    cloudDownloadOutline, eyeOutline, arrowBackOutline,
    ribbonOutline, ribbon, checkmarkCircle,
    calendarOutline, qrCodeOutline, chevronForward
} from 'ionicons/icons';

@Component({
    selector: 'app-mis-certificados',
    templateUrl: './certificados.page.html',
    styleUrls: ['./certificados.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MisCertificadosPage implements OnInit {

    loading = true;
    idCapacitacion: number | null = null;

    // Single View Data
    certificadoData: any = null;
    plantillaData: any = null;
    pdfUrl: string | null = null;

    // List View Data
    certificados: any[] = [];

    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);
    private toastController = inject(ToastController);
    private authService = inject(AuthService);

    constructor() {
        addIcons({ cloudDownloadOutline, eyeOutline, arrowBackOutline, ribbonOutline, ribbon, checkmarkCircle, calendarOutline, qrCodeOutline, chevronForward });
    }

    ngOnInit() {
        // Combinamos la escucha de parámetros de ruta y de consulta
        this.route.queryParamMap.subscribe(queryParams => {
            const rawId = queryParams.get('idCapacitacion') ?? this.route.snapshot.paramMap.get('Id_Capacitacion');
            const parsedId = rawId ? Number(rawId) : NaN;

            this.idCapacitacion = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;

            if (this.idCapacitacion !== null) {
                this.cargarUnCertificado(this.idCapacitacion);
            } else {
                this.idCapacitacion = null;
                this.cargarTodosLosCertificados();
            }
        });
    }

    async cargarTodosLosCertificados() {
        this.loading = true;
        this.cdr.markForCheck();
        try {
            console.log('[CERTIFICADOS] Cargando todos los certificados...');
            const response = await firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/certificados/my`));
            this.certificados = response || [];
            console.log('[CERTIFICADOS] Cargados:', this.certificados.length);
        } catch (e) {
            console.error('[CERTIFICADOS] Error fetching all certificates', e);
            this.certificados = [];
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    async cargarUnCertificado(idCapacitacion: number) {
        this.loading = true;
        this.cdr.markForCheck();
        try {
            console.log('[CERTIFICADOS] Cargando certificado para capacitación:', idCapacitacion);
            const certs = await firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/certificados/my`)) || [];
            const cert = certs.find((c: any) => {
                const capacitacionId = Number(c?.capacitacionId ?? c?.Id_Capacitacion ?? c?.capacitacion?.id);
                return Number.isInteger(capacitacionId) && capacitacionId === idCapacitacion;
            });

            if (cert) {
                const currentUser = this.authService.currentUser() || null;
                const usuario = cert.usuario || currentUser || { nombre: 'Participante' };
                if (!usuario.nombre && currentUser?.nombre) {
                    usuario.nombre = currentUser.nombre;
                }

                this.certificadoData = {
                    ...cert,
                    usuario,
                    capacitacion: cert.capacitacion || { nombre: 'Capacitación' },
                    fecha: cert.fechaEmision ? new Date(cert.fechaEmision).toLocaleDateString() : 'N/A'
                };

                // Recuperar datos de la plantilla para la vista previa
                this.plantillaData = cert.capacitacion?.plantilla || null;
                console.log('[CERTIFICADOS] Plantilla cargada:', this.plantillaData?.nombre || 'Ninguna');
                console.log('[CERTIFICADOS] Configuración de plantilla:', this.plantillaData?.configuracion);

                const baseUrl = environment.apiUrl.replace('/api', '');
                this.pdfUrl = `${baseUrl}${cert.pdfUrl}`;
                console.log('[CERTIFICADOS] Certificado encontrado:', cert.id);
            } else {
                console.warn('[CERTIFICADOS] No se encontró certificado para ID:', idCapacitacion);
                this.certificadoData = null;
                // Si no se encuentra, volvemos a la lista
                this.idCapacitacion = null;
            }
        } catch (e) {
            console.error('[CERTIFICADOS] Error fetching single certificate', e);
            this.certificadoData = null;
            this.idCapacitacion = null;
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    verCertificado(cert: any) {
        this.router.navigate(['/mis-certificados'], { queryParams: { idCapacitacion: cert.capacitacionId } });
    }

    async generarPDF(action: 'download' | 'open') {
        if (!this.pdfUrl) return;

        try {
            if (Capacitor.isNativePlatform()) {
                // En Android/iOS abrir en navegador del sistema evita bloqueos de WebView.
                await Browser.open({ url: this.pdfUrl });
                if (action === 'download') {
                    await this.mostrarToast('Se abrio el documento. Usa el menu del navegador para descargarlo.', 'primary');
                }
                return;
            }

            if (action === 'download') {
                const anchor = document.createElement('a');
                anchor.href = this.pdfUrl;
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';
                anchor.download = 'certificado.pdf';
                anchor.click();
                return;
            }

            window.open(this.pdfUrl, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('[CERTIFICADOS] No se pudo abrir el PDF', error);
            await this.mostrarToast('No se pudo abrir el documento. Intentalo nuevamente.', 'danger');
        }
    }

    getImageUrl(path: string | undefined): string | null {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = environment.apiUrl.replace('/api', '');
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    }

    volverAlListado() {
        this.idCapacitacion = null;
        this.certificadoData = null;
        this.plantillaData = null;
        this.router.navigate(['/mis-certificados'], { queryParams: { idCapacitacion: null } });
        this.cdr.detectChanges();
    }

    async onPreviewImageError(event: Event) {
        const target = event.target as HTMLImageElement;
        if (target) {
            target.src = 'assets/certificados/placeholder-cert.png';
            target.onerror = null;
        }
    }

    private async mostrarToast(message: string, color: 'primary' | 'danger' = 'primary') {
        const toast = await this.toastController.create({
            message,
            duration: 2500,
            color,
            position: 'bottom'
        });
        await toast.present();
    }

    getConfiguredFields(): { key: string, config: any }[] {
        if (!this.plantillaData?.configuracion) {
            console.log('[CERTIFICADOS] No hay configuración de plantilla');
            return [];
        }

        const fields = Object.entries(this.plantillaData.configuracion)
            .filter(([key]) => key !== 'codigoQR' && key !== 'firmas') // Excluir QR y firmas
            .map(([key, config]) => ({ key, config }));

        console.log('[CERTIFICADOS] Campos configurados encontrados:', fields.length, fields);
        return fields;
    }

    getFieldLabel(key: string): string {
        const labels: Record<string, string> = {
            nombreUsuario: 'Participante',
            curso: 'Curso/Capacitación',
            fecha: 'Fecha de Emisión',
            cedula: 'Cédula',
            rol: 'Rol',
            horas: 'Horas',
            parrafo: 'Descripción'
        };
        return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
    }

    getFieldValue(key: string): string {
        if (!this.certificadoData) return 'N/A';

        switch (key) {
            case 'nombreUsuario':
                return this.certificadoData.usuario?.nombre || 'N/A';
            case 'curso':
                return this.certificadoData.capacitacion?.nombre || 'N/A';
            case 'fecha':
                return this.certificadoData.fecha || 'N/A';
            case 'cedula':
                return this.certificadoData.usuario?.ci || 'N/A';
            case 'rol':
                return this.certificadoData.usuario?.rol?.nombre || 'Participante';
            case 'horas':
                return this.certificadoData.capacitacion?.horas || 'N/A';
            case 'parrafo':
                // Para párrafos con template, procesar los placeholders
                const config = this.plantillaData?.configuracion?.[key];
                if (config?.textoTemplate) {
                    let text = config.textoTemplate;
                    const data = {
                        usuario: this.certificadoData.usuario?.nombre || '',
                        curso: this.certificadoData.capacitacion?.nombre || '',
                        fecha: this.certificadoData.fecha || '',
                        horas: this.certificadoData.capacitacion?.horas || '',
                        modalidad: this.certificadoData.capacitacion?.modalidad || 'virtual'
                    };
                    Object.entries(data).forEach(([k, v]) => {
                        text = text.replace(new RegExp(`{{${k}}}`, 'g'), v);
                    });
                    return text;
                }
                return 'N/A';
            default:
                return this.certificadoData[key] || 'N/A';
        }
    }
}
