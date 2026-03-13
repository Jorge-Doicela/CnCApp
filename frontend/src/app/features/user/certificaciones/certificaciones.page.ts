import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import {
    cloudDownloadOutline, eyeOutline, arrowBackOutline,
    ribbonOutline, ribbon, checkmarkCircle,
    calendarOutline, qrCodeOutline, chevronForward
} from 'ionicons/icons';



@Component({
    selector: 'app-certificaciones',
    template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button *ngIf="!idCapacitacion" defaultHref="/home"></ion-back-button>
          <ion-button *ngIf="idCapacitacion" (click)="volverAlListado()">
            <ion-icon name="arrow-back-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ idCapacitacion ? 'Vista de Certificado' : 'Mis Títulos Obtenidos' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      
      <!-- Loading State -->
      <div *ngIf="loading" class="ion-text-center ion-padding">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Procesando información...</p>
      </div>

      <!-- Error / Empty State -->
      <div *ngIf="!loading && !certificadoData && !certificados.length" class="empty-state">
        <div class="empty-icon-box">
          <ion-icon name="ribbon-outline"></ion-icon>
        </div>
        <h3>No tienes certificados aún</h3>
        <p>Completa tus capacitaciones para obtener tus certificados oficiales.</p>
        <ion-button fill="outline" routerLink="/home">Explorar Cursos</ion-button>
      </div>

      <!-- SINGLE CERTIFICATE VIEW (Preview) -->
      <div *ngIf="!loading && idCapacitacion && certificadoData" class="preview-container">
        <ion-card class="cert-preview-card">
          <div class="pdf-snapshot">
            <img [src]="getImageUrl(plantillaData?.imagenUrl) || 'assets/certificados/placeholder-cert.png'" class="bg-img">
            <div class="snapshot-overlay">
              <div class="qr-placeholder"></div>
              <p class="user-placeholder">{{ certificadoData.usuario?.nombre }}</p>
            </div>
          </div>
          
          <ion-card-header>
            <div class="cert-category">CERTIFICADO OFICIAL</div>
            <ion-card-title>{{ (certificadoData.capacitacion?.nombre || 'Capacitación').toUpperCase() }}</ion-card-title>
            <ion-card-subtitle>A nombre de: {{ certificadoData.usuario?.nombre }}</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <div class="cert-info-grid">
               <div class="info-item">
                  <ion-icon name="calendar-outline"></ion-icon>
                  <div>
                    <small>Emitido el</small>
                    <p>{{ (certificadoData.fecha || 'Recientemente') }}</p>
                  </div>
               </div>
               <div class="info-item">
                  <ion-icon name="qr-code-outline"></ion-icon>
                  <div>
                    <small>Código QR</small>
                    <p>Verificado</p>
                  </div>
               </div>
            </div>

            <div class="preview-actions">
              <ion-button expand="block" (click)="generarPDF('download')" class="main-btn">
                <ion-icon name="cloud-download-outline" slot="start"></ion-icon>
                Descargar Documento
              </ion-button>
              <ion-button expand="block" fill="outline" (click)="generarPDF('open')" class="sec-btn">
                <ion-icon name="eye-outline" slot="start"></ion-icon>
                Ver en Pantalla Completa
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- LIST VIEW (All Certificates) -->
      <div *ngIf="!loading && !idCapacitacion && certificados.length" class="list-container">
        <div class="list-header">
            <h3>Tus Logros Académicos</h3>
            <p>Has obtenido {{ certificados.length }} certificación(es) oficial(es).</p>
        </div>

        <div class="cert-grid">
          <ion-card class="cert-item-card" *ngFor="let cert of certificados" (click)="verCertificado(cert)">
            <div class="cert-item-header">
                <div class="icon-circle">
                    <ion-icon name="ribbon"></ion-icon>
                </div>
                <div class="cert-date">{{ cert.createdAt | date:'longDate' }}</div>
            </div>
            
            <ion-card-content>
              <h4 class="cert-name">{{ cert.capacitacion?.nombre || 'Certificado de Capacitación' }}</h4>
              <p class="cert-desc">{{ cert.capacitacion?.descripcion || 'Completado con éxito' }}</p>
              
              <div class="cert-footer-info">
                  <span class="badge-verified">
                     <ion-icon name="checkmark-circle"></ion-icon>
                     Verificado
                  </span>
                  <ion-icon name="chevron-forward" class="arrow"></ion-icon>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

    </ion-content>
  `,
    styles: [`
    :host {
      --primary-color: #1e3a8a;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: 100px;
        text-align: center;
        color: #64748b;

        .empty-icon-box {
            width: 80px;
            height: 80px;
            background: #f1f5f9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            margin-bottom: 20px;
            color: #94a3b8;
        }

        h3 {
            color: #1e293b;
            font-weight: 750;
            margin-bottom: 8px;
        }

        p {
            margin-bottom: 24px;
            max-width: 280px;
        }
    }

    /* PREVIEW VIEW */
    .preview-container {
        display: flex;
        justify-content: center;
        padding-top: 20px;
    }
    .cert-preview-card {
        max-width: 550px;
        width: 100%;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        border: none;
    }
    .pdf-snapshot {
        position: relative;
        background: #f8fafc;
        aspect-ratio: 1.414 / 1; /* A4 aspect ratio */
        overflow: hidden;
    }
    .bg-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.9;
    }
    .snapshot-overlay {
        position: absolute;
        bottom: 40px;
        left: 0;
        right: 0;
        text-align: center;
    }
    .user-placeholder {
        font-family: serif;
        font-size: 1.8rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
    }

    .cert-category {
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: var(--primary-color);
        margin-bottom: 4px;
    }
    
    .cert-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        background: #f8fafc;
        padding: 16px;
        border-radius: 16px;
        margin: 16px 0;
    }
    .info-item {
        display: flex;
        align-items: center;
        gap: 12px;
        ion-icon { color: #64748b; font-size: 20px; }
        small { display: block; font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
        p { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin: 0; }
    }

    .preview-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 20px;

        .main-btn { --background: #0f172a; --border-radius: 14px; --height: 52px; font-weight: 800; }
        .sec-btn { --border-radius: 14px; --height: 52px; font-weight: 800; }
    }

    /* LIST VIEW */
    .list-header {
        margin-bottom: 30px;
        h3 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
        p { color: #64748b; font-size: 0.95rem; }
    }

    .cert-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
    }

    .cert-item-card {
        margin: 0;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
        transition: all 0.3s;
        cursor: pointer;
        padding: 4px;

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.06);
            border-color: #cbd5e1;
            .arrow { transform: translateX(4px); color: var(--primary-color); }
        }

        .cert-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 16px 0;

            .icon-circle {
                width: 40px;
                height: 40px;
                background: #eff6ff;
                color: #2563eb;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }

            .cert-date {
                font-size: 0.75rem;
                font-weight: 650;
                color: #94a3b8;
            }
        }

        .cert-name {
            font-size: 1.1rem;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 8px;
            line-height: 1.3;
        }

        .cert-desc {
            font-size: 0.85rem;
            color: #64748b;
            margin-bottom: 16px;
            line-height: 1.5;
        }

        .cert-footer-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 14px;
            border-top: 1px solid #f1f5f9;

            .badge-verified {
                font-size: 0.7rem;
                font-weight: 800;
                color: #15803d;
                background: #f0fdf4;
                padding: 4px 8px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                gap: 4px;
                text-transform: uppercase;
            }

            .arrow {
                color: #cbd5e1;
                transition: all 0.3s;
            }
        }
    }
  `],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificacionesPage implements OnInit {

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
                    fecha: cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : 'N/A'
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
        this.router.navigate(['/ver-certificaciones'], { queryParams: { idCapacitacion: cert.capacitacionId } });
    }

    generarPDF(action: 'download' | 'open') {
        if (!this.pdfUrl) return;
        window.open(this.pdfUrl, '_blank');
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
        this.router.navigate(['/ver-certificaciones'], { queryParams: { idCapacitacion: null } });
        this.cdr.detectChanges();
    }
}
