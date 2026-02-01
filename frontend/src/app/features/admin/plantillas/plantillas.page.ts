import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController, NavController } from '@ionic/angular';
import { PlantillasService, PlantillaCertificado } from './services/plantillas.service';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, documentTextOutline } from 'ionicons/icons';

@Component({
    selector: 'app-plantillas',
    template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Gestión de Plantillas</ion-title>
        <ion-buttons slot="end">
            <ion-button (click)="crearPlantilla()">
                <ion-icon name="add-outline" slot="icon-only"></ion-icon>
            </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      
      <div class="header-section ion-text-center">
        <h2>Plantillas de Certificados</h2>
        <p>Gestiona los diseños para tus conferencias</p>
      </div>

      <div class="grid-container">
        <ion-card *ngFor="let plantilla of plantillas" class="plantilla-card">
            <div class="image-container">
                <img [src]="plantilla.imagenUrl" [alt]="plantilla.nombre">
            </div>
            <ion-card-header>
                <ion-card-title>{{ plantilla.nombre }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
                <div class="actions">
                    <ion-button fill="clear" (click)="editarPlantilla(plantilla.id)">
                        <ion-icon name="create-outline" slot="start"></ion-icon>
                        Editar
                    </ion-button>
                    <ion-button fill="clear" color="danger" (click)="eliminarPlantilla(plantilla.id)">
                        <ion-icon name="trash-outline" slot="start"></ion-icon>
                        Eliminar
                    </ion-button>
                </div>
            </ion-card-content>
        </ion-card>

        <div class="empty-state" *ngIf="plantillas.length === 0">
            <ion-icon name="document-text-outline"></ion-icon>
            <p>No hay plantillas creadas</p>
            <ion-button fill="outline" (click)="crearPlantilla()">Crear Nueva</ion-button>
        </div>
      </div>

    </ion-content>
  `,
    styles: [`
    .grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    .plantilla-card {
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .image-container {
        height: 200px;
        overflow: hidden;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .image-container img {
        width: 100%;
        height: 100%;
        object-fit: contain; /* Changed to contain to show full cert */
    }
    .actions {
        display: flex;
        justify-content: space-between;
    }
    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 50px;
        color: var(--ion-color-medium);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }
    .empty-state ion-icon {
        font-size: 64px;
        margin-bottom: 10px;
    }
  `],
    standalone: true,
    imports: [CommonModule, IonicModule]
})
export class PlantillasPage implements OnInit {
    plantillas: PlantillaCertificado[] = [];

    private plantillasService = inject(PlantillasService);
    private navController = inject(NavController);
    private alertController = inject(AlertController);

    constructor() {
        addIcons({ addOutline, createOutline, trashOutline, documentTextOutline });
    }

    ngOnInit() {
        this.cargarPlantillas();
    }

    ionViewWillEnter() {
        this.cargarPlantillas();
    }

    cargarPlantillas() {
        this.plantillasService.getPlantillas().subscribe(p => this.plantillas = p);
    }

    crearPlantilla() {
        this.navController.navigateForward('/gestionar-plantillas/crear');
    }

    editarPlantilla(id: number) {
        this.navController.navigateForward(`/gestionar-plantillas/editar/${id}`);
    }

    async eliminarPlantilla(id: number) {
        const alert = await this.alertController.create({
            header: 'Confirmar',
            message: '¿Estás seguro de eliminar esta plantilla?',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: () => {
                        this.plantillasService.deletePlantilla(id).subscribe(() => {
                            this.cargarPlantillas();
                        });
                    }
                }
            ]
        });
        await alert.present();
    }
}
