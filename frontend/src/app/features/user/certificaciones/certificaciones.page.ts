import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import { cloudDownloadOutline, eyeOutline, arrowBackOutline } from 'ionicons/icons';



@Component({
    selector: 'app-certificaciones',
    template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/ver-conferencias"></ion-back-button>
        </ion-buttons>
        <ion-title>Certificado</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
        
        <div *ngIf="loading" class="ion-text-center ion-padding">
            <ion-spinner></ion-spinner>
            <p>Generando vista previa...</p>
        </div>

        <div *ngIf="!loading && !certificadoData" class="empty-state">
            <p>No se encontró información del certificado.</p>
        </div>

        <div *ngIf="!loading && certificadoData" class="container">
            <ion-card class="cert-preview">
                <div class="pdf-placeholder">
                    <img [src]="plantillaData?.imagenUrl || 'assets/certificados/placeholder-cert.png'" class="bg-preview">
                    <div class="overlay-text">
                        <p><strong>{{ certificadoData.usuario?.nombre }}</strong></p>
                        <p>{{ certificadoData.capacitacion?.nombre }}</p>
                    </div>
                </div>
                <ion-card-header>
                    <ion-card-title>{{ certificadoData.capacitacion?.nombre }}</ion-card-title>
                    <ion-card-subtitle>Otorgado a: {{ certificadoData.usuario?.nombre }}</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                    <div class="actions">
                        <ion-button expand="block" (click)="generarPDF('download')">
                            <ion-icon name="cloud-download-outline" slot="start"></ion-icon>
                            Descargar PDF
                        </ion-button>
                         <ion-button expand="block" fill="outline" (click)="generarPDF('open')">
                            <ion-icon name="eye-outline" slot="start"></ion-icon>
                            Abrir PDF
                        </ion-button>
                    </div>
                </ion-card-content>
            </ion-card>
        </div>

    </ion-content>
  `,
    styles: [`
    .container {
        display: flex;
        justify-content: center;
    }
    .cert-preview {
        max-width: 600px;
        width: 100%;
    }
    .pdf-placeholder {
        position: relative;
        background: #eee;
        height: 300px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .bg-preview {
        width: 100%;
        height: 100%;
        object-fit: contain;
        opacity: 0.7;
    }
    .overlay-text {
        position: absolute;
        text-align: center;
        background: rgba(255,255,255,0.8);
        padding: 10px;
        border-radius: 8px;
    }
    .actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 10px;
    }
  `],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule]
})
export class CertificacionesPage implements OnInit {

    loading = true;
    certificadoData: any = null;
    plantillaData: any = null;
    idCapacitacion: number | null = null;
    pdfUrl: string | null = null;

    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);
    private loadingCtrl = inject(LoadingController);

    constructor() {
        addIcons({ cloudDownloadOutline, eyeOutline, arrowBackOutline });
    }

    ngOnInit() {
        this.idCapacitacion = Number(this.route.snapshot.paramMap.get('Id_Capacitacion') || this.route.snapshot.queryParamMap.get('idCapacitacion'));

        if (this.idCapacitacion) {
            this.cargarDatos(this.idCapacitacion);
        } else {
            this.loading = false;
        }
    }

    async cargarDatos(idCapacitacion: number) {
        try {
            // Fetch my certificates
            const certs = await this.http.get<any[]>(`${environment.apiUrl}/certificados/my`).toPromise();

            if (certs && certs.length > 0) {
                // Find the one for this training
                const cert = certs.find(c => c.capacitacionId === idCapacitacion);

                if (cert) {
                    this.certificadoData = {
                        usuario: { nombre: 'Participante' }, // Name is in the PDF
                        capacitacion: { nombre: 'Capacitación' }, // Details in PDF
                        // We could fetch details if we wanted better UI text, but PDF is what matters
                    };

                    // Construct full URL. 
                    // API URL is http://localhost:3000/api
                    // PDF URL is /certificados/file.pdf (relative to public root)
                    // Base URL is http://localhost:3000

                    const baseUrl = environment.apiUrl.replace('/api', '');
                    this.pdfUrl = `${baseUrl}${cert.pdfUrl}`;
                }
            }
        } catch (e) {
            console.error('Error fetching certificates', e);
        } finally {
            this.loading = false;
        }
    }

    generarPDF(action: 'download' | 'open') {
        if (!this.pdfUrl) return;
        window.open(this.pdfUrl, '_blank');
    }
}
