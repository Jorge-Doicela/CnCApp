import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonItem, IonButton, IonIcon,
    IonInput, AlertController, ToastController,
    IonCardSubtitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    addCircleOutline, createOutline, trashOutline,
    searchOutline, ribbonOutline
} from 'ionicons/icons';
import { GradosOcupacionalesService, GradoOcupacional } from './services/grados.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-grados-ocupacionales',
    templateUrl: './grados-ocupacionales.page.html',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
        IonMenuButton, IonCard, IonCardHeader, IonCardTitle,
        IonCardContent, IonItem, IonButton, IonIcon,
        IonInput, IonCardSubtitle
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GradosOcupacionalesPage implements OnInit {
    grados: GradoOcupacional[] = [];
    filteredGrados: GradoOcupacional[] = [];
    searchTerm: string = '';

    private cd = inject(ChangeDetectorRef);

    constructor(
        private gradosService: GradosOcupacionalesService,
        private router: Router,
        private alertController: AlertController,
        private toastController: ToastController
    ) {
        addIcons({
            'add-circle-outline': addCircleOutline,
            'create-outline': createOutline,
            'trash-outline': trashOutline,
            'search-outline': searchOutline,
            'ribbon-outline': ribbonOutline
        });
    }

    ngOnInit() {
        this.loadGrados();
    }

    ionViewWillEnter() {
        this.loadGrados();
    }

    async loadGrados() {
        try {
            const data = await firstValueFrom(this.gradosService.getAll());
            this.grados = data;
            this.filterGrados();
        } catch (err) {
            console.error('Error loading grados:', err);
            this.presentToast('Error al cargar los grados ocupacionales', 'danger');
        } finally {
            this.cd.markForCheck();
        }
    }

    filterGrados() {
        if (!this.searchTerm) {
            this.filteredGrados = this.grados;
            return;
        }
        const term = this.searchTerm.toLowerCase();
        this.filteredGrados = this.grados.filter(g =>
            g.nombre.toLowerCase().includes(term)
        );
        this.cd.markForCheck();
    }

    iraCrearGrado() {
        this.router.navigate(['/gestionar-grados/crear']);
    }

    iraEditarGrado(id: number) {
        this.router.navigate(['/gestionar-grados/editar', id]);
    }

    async confirmarEliminar(id: number) {
        const alert = await this.alertController.create({
            header: 'Confirmar eliminación',
            message: '¿Está seguro que desea eliminar este grado ocupacional?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Eliminar',
                    handler: () => {
                        this.eliminarGrado(id);
                    }
                }
            ]
        });
        await alert.present();
    }

    async eliminarGrado(id: number) {
        try {
            await firstValueFrom(this.gradosService.delete(id));
            this.presentToast('Grado eliminado correctamente', 'success');
            this.loadGrados();
        } catch (err) {
            console.error('Error deleting grado:', err);
            this.presentToast('Error al eliminar grado', 'danger');
        } finally {
            this.cd.markForCheck();
        }
    }

    async presentToast(message: string, color: string) {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            color,
            position: 'bottom'
        });
        toast.present();
    }
}
