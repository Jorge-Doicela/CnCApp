import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import { cloudDownloadOutline, eyeOutline, arrowBackOutline } from 'ionicons/icons';

// PDFMake imports
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Fix for pdfMake vfs
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

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

    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);
    private loadingCtrl = inject(LoadingController);
    private toastCtrl = inject(ToastController);

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
        // We need to fetch:
        // 1. Certificate Data (QR, Date) specific to User+Capacitacion
        // 2. Plantilla Config (Image, Coordinates)

        // Since we don't have a dedicated endpoint for "My Certificate Info", we might need to rely on what we have.
        // Or use the public validation endpoint?

        // Let's assume we fetch the Capacitacion details which includes PlantillaId
        // And we fetch the User's inscriptions to get the QR code if generated.

        // Ideally Backend should have: GET /certificados/mine/:idCapacitacion

        // Mocking for now to enable functionality
        try {
            const certs = await this.http.get<any[]>(`${environment.apiUrl}/users/me/certificados`).toPromise(); // Hypothetical endpoint
            // Fallback: fetch list and find
            // Since we don't have that endpoint yet, let's assume we pass data or fetch generic

            // Let's implement a quick backend endpoint? No, let's use what we have in frontend services.
            // We can use CapacitacionesService.getInscripcionesUsuario() from previous step logic.

            const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
            const inscripciones = await this.http.get<any[]>(`${environment.apiUrl}/usuarios-capacitaciones/usuario/${userId}`).toPromise();

            if (!inscripciones) throw new Error("No inscriptions");

            const inscripcion = inscripciones.find(i => i.Id_Capacitacion === idCapacitacion);

            if (inscripcion && inscripcion.capacitacion) {
                this.certificadoData = {
                    usuario: { nombre: JSON.parse(localStorage.getItem('user') || '{}').nombre },
                    capacitacion: inscripcion.capacitacion,
                    fecha: new Date().toLocaleDateString(), // Should be cert date
                    qr: 'MOCK_QR_HASH'
                };

                // Fetch Plantilla if exists
                if (inscripcion.capacitacion.plantillaId) {
                    // Fetch template
                    // this.plantillaData = ...
                }
            }

        } catch (e) {
            console.error(e);
        } finally {
            this.loading = false;
        }
    }

    getBase64ImageFromURL(url: string) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.setAttribute("crossOrigin", "anonymous");
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL("image/png");
                resolve(dataURL);
            };
            img.onerror = error => reject(error);
            img.src = url;
        });
    }

    async generarPDF(action: 'download' | 'open') {
        if (!this.certificadoData) return;

        const loader = await this.loadingCtrl.create({ message: 'Generando PDF...' });
        await loader.present();

        try {
            // Prepare assets
            let background = null;
            if (this.plantillaData?.imagenUrl) {
                try {
                    background = await this.getBase64ImageFromURL(this.plantillaData.imagenUrl);
                } catch (e) {
                    console.warn('Could not load background', e);
                }
            }

            const docDefinition: any = {
                pageSize: 'A4',
                pageOrientation: 'landscape', // Certificates usually landscape
                background: background ? [
                    {
                        image: background,
                        width: 842, // A4 landscape width points
                        height: 595
                    }
                ] : undefined,
                content: [
                    // Dynamic Content based on Config
                    // If no config, use standard layout
                    {
                        text: this.certificadoData.usuario.nombre.toUpperCase(),
                        style: 'name',
                        absolutePosition: { x: 100, y: 250 } // Example default
                    },
                    {
                        text: `Por haber aprobado el curso: ${this.certificadoData.capacitacion.nombre}`,
                        style: 'course',
                        absolutePosition: { x: 100, y: 300 }
                    },
                    {
                        qr: this.certificadoData.qr || 'VALID',
                        fit: 80,
                        absolutePosition: { x: 700, y: 450 }
                    }
                ],
                styles: {
                    name: { fontSize: 24, bold: true },
                    course: { fontSize: 18 }
                }
            };

            const pdfDoc = pdfMake.createPdf(docDefinition);

            if (action === 'download') {
                pdfDoc.download(`Certificado-${this.certificadoData.capacitacion.nombre}.pdf`);
            } else {
                pdfDoc.open();
            }

        } catch (e) {
            const toast = await this.toastCtrl.create({ message: 'Error generando PDF', color: 'danger', duration: 2000 });
            toast.present();
        } finally {
            loader.dismiss();
        }
    }

}
