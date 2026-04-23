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

    constructor() {
        addIcons({ cloudDownloadOutline, eyeOutline, arrowBackOutline, ribbonOutline, ribbon, checkmarkCircle, calendarOutline, qrCodeOutline, chevronForward });
    }

    ngOnInit() {
        // Combinamos la escucha de parámetros de ruta y de consulta
        this.route.queryParamMap.subscribe(queryParams => {
            const idParam = queryParams.get('idCapacitacion') || 
                            this.route.snapshot.paramMap.get('Id_Capacitacion');
            
            this.idCapacitacion = idParam ? Number(idParam) : null;

            if (this.idCapacitacion && !isNaN(this.idCapacitacion)) {
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
            const cert = certs.find((c: any) => c.capacitacionId === idCapacitacion);

            if (cert) {
                this.certificadoData = {
                    ...cert,
                    usuario: cert.usuario || { nombre: 'Participante' },
                    capacitacion: cert.capacitacion || { nombre: 'Capacitación' },
                    fecha: cert.fechaEmision ? new Date(cert.fechaEmision).toLocaleDateString() : 'N/A'
                };

                // Recuperar datos de la plantilla para la vista previa
                this.plantillaData = cert.capacitacion?.plantilla || null;
                console.log('[CERTIFICADOS] Plantilla cargada:', this.plantillaData?.nombre || 'Ninguna');

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

    private async mostrarToast(message: string, color: 'primary' | 'danger' = 'primary') {
        const toast = await this.toastController.create({
            message,
            duration: 2500,
            color,
            position: 'bottom'
        });
        await toast.present();
    }
}
