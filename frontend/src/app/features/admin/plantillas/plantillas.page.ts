import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, NavController, LoadingController, ModalController } from '@ionic/angular';
import { PlantillasService } from './services/plantillas.service';
import { PlantillaCertificado } from '../../../core/models/plantilla.interface';
import { addIcons } from 'ionicons';
import { firstValueFrom } from 'rxjs';
import {
    addOutline,
    createOutline,
    trashOutline,
    documentTextOutline,
    eyeOutline,
    checkmarkCircle,
    radioButtonOn,
    radioButtonOff,
    layersOutline,
    calendarOutline,
    searchOutline
} from 'ionicons/icons';

@Component({
    selector: 'app-plantillas',
    templateUrl: './plantillas.page.html',
    styleUrls: ['./plantillas.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule]
})
export class PlantillasPage implements OnInit {
    plantillas: PlantillaCertificado[] = [];
    plantillasFiltradas: PlantillaCertificado[] = [];
    terminoBusqueda: string = '';
    cargando: boolean = true;

    private plantillasService = inject(PlantillasService);
    private navController = inject(NavController);
    private alertController = inject(AlertController);
    private toastController = inject(ToastController);
    private loadingController = inject(LoadingController);

    private cd = inject(ChangeDetectorRef);

    constructor() {
        addIcons({
            addOutline,
            createOutline,
            trashOutline,
            documentTextOutline,
            eyeOutline,
            checkmarkCircle,
            radioButtonOn,
            radioButtonOff,
            layersOutline,
            calendarOutline,
            searchOutline
        });
    }

    ngOnInit() {
        this.cargarPlantillas();
    }

    ionViewWillEnter() {
        this.cargarPlantillas();
    }

    async cargarPlantillas() {
        this.cargando = true;
        this.cd.detectChanges();
        try {
            const plantillas = await firstValueFrom(this.plantillasService.getPlantillas());
            this.plantillas = plantillas;
            this.plantillasFiltradas = plantillas;
        } catch (error) {
            console.error('Error al cargar plantillas:', error);
            this.mostrarToast('Error al cargar plantillas', 'danger');
        } finally {
            this.cargando = false;
            this.cd.detectChanges();
        }
    }

    filtrarPlantillas() {
        if (!this.terminoBusqueda || this.terminoBusqueda.trim() === '') {
            this.plantillasFiltradas = this.plantillas;
            return;
        }

        const termino = this.terminoBusqueda.toLowerCase().trim();
        this.plantillasFiltradas = this.plantillas.filter(p =>
            p.nombre.toLowerCase().includes(termino)
        );
    }

    limpiarBusqueda() {
        this.terminoBusqueda = '';
        this.filtrarPlantillas();
    }

    contarCampos(plantilla: PlantillaCertificado): number {
        return Object.keys(plantilla.configuracion).length;
    }

    crearPlantilla() {
        this.navController.navigateForward('/gestionar-plantillas/crear');
    }

    editarPlantilla(id: number) {
        this.navController.navigateForward(`/gestionar-plantillas/editar/${id}`);
    }

    async toggleActivar(plantilla: PlantillaCertificado) {
        if (plantilla.activa) {
            this.mostrarToast('Esta plantilla ya está activa', 'warning');
            return;
        }

        const alert = await this.alertController.create({
            header: 'Activar Plantilla',
            message: '¿Deseas activar esta plantilla? La plantilla activa actual será desactivada.',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Activar',
                    handler: async () => {
                        const loading = await this.loadingController.create({
                            message: 'Activando plantilla...'
                        });
                        await loading.present();

                        this.plantillasService.activarPlantilla(plantilla.id).subscribe({
                            next: () => {
                                loading.dismiss();
                                this.mostrarToast('Plantilla activada correctamente', 'success');
                                this.cargarPlantillas();
                            },
                            error: (error) => {
                                console.error('Error al activar plantilla:', error);
                                loading.dismiss();
                                this.mostrarToast('Error al activar plantilla', 'danger');
                            }
                        });
                    }
                }
            ]
        });
        await alert.present();
    }

    async confirmarEliminar(plantilla: PlantillaCertificado) {
        if (plantilla.activa) {
            this.mostrarToast('No puedes eliminar la plantilla activa', 'warning');
            return;
        }

        const alert = await this.alertController.create({
            header: 'Confirmar Eliminación',
            message: `¿Estás seguro de eliminar la plantilla "${plantilla.nombre}"? Esta acción no se puede deshacer.`,
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: async () => {
                        const loading = await this.loadingController.create({
                            message: 'Eliminando plantilla...'
                        });
                        await loading.present();

                        this.plantillasService.deletePlantilla(plantilla.id).subscribe({
                            next: () => {
                                loading.dismiss();
                                this.mostrarToast('Plantilla eliminada correctamente', 'success');
                                this.cargarPlantillas();
                            },
                            error: (error) => {
                                console.error('Error al eliminar plantilla:', error);
                                loading.dismiss();
                                this.mostrarToast('Error al eliminar plantilla', 'danger');
                            }
                        });
                    }
                }
            ]
        });
        await alert.present();
    }

    previsualizarPlantilla(plantilla: PlantillaCertificado) {
        // TODO: Implement preview modal
        this.mostrarToast('Vista previa próximamente', 'primary');
    }

    onImageError(event: any) {
        event.target.src = 'assets/placeholder-certificate.png';
    }

    async mostrarToast(mensaje: string, color: string = 'primary') {
        const toast = await this.toastController.create({
            message: mensaje,
            duration: 3000,
            position: 'top',
            color: color,
            buttons: [
                {
                    text: 'Cerrar',
                    role: 'cancel'
                }
            ]
        });
        await toast.present();
    }
}
