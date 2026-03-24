import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonItem, IonLabel, IonButton, IonIcon,
  IonList, IonInput, AlertController, ToastController,
  IonCardSubtitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline, createOutline, trashOutline,
  searchOutline, briefcaseOutline, calendarOutline,
  chevronBackOutline, pauseCircleOutline, playCircleOutline,
  close, search, funnelOutline, businessOutline,
  checkmarkCircleOutline, closeCircleOutline, alertCircleOutline,
  keyOutline, swapVerticalOutline, locationOutline,
  callOutline, mailOutline, layersOutline
} from 'ionicons/icons';
import { CargService, Cargo } from './services/cargos.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crudcargosinstituciones',
  templateUrl: './crudcargosinstituciones.page.html',
  styleUrls: ['./crudcargosinstituciones.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonItem, IonLabel, IonButton, IonIcon,
    IonList, IonInput, IonCardSubtitle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrudcargosinstitucionesPage implements OnInit {
  cargos: Cargo[] = [];
  filteredCargos: Cargo[] = [];
  searchTerm: string = '';

  private cd = inject(ChangeDetectorRef);

  constructor(
    private cargService: CargService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      'search-outline': searchOutline,
      'search': search,
      'filter-outline': funnelOutline, // funnel usado como filter
      'funnel-outline': funnelOutline,
      'business-outline': businessOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline,
      'alert-circle-outline': alertCircleOutline,
      'key-outline': keyOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'swap-vertical-outline': swapVerticalOutline,
      'add-circle-outline': addCircleOutline,
      'location-outline': locationOutline,
      'call-outline': callOutline,
      'mail-outline': mailOutline,
      'calendar-outline': calendarOutline,
      'briefcase-outline': briefcaseOutline,
      'chevron-back-outline': chevronBackOutline,
      'pause-circle-outline': pauseCircleOutline,
      'play-circle-outline': playCircleOutline,
      'layers-outline': briefcaseOutline, // Fallback
      'close': close
    });
  }

  ngOnInit() {
    this.ionViewWillEnter();
  }

  ionViewWillEnter() {
    this.loadCargos();
  }

  async loadCargos() {
    try {
      const data = await firstValueFrom(this.cargService.getAll());
      this.cargos = data;
      this.filterCargos();
    } catch (err) {
      console.error('Error loading cargos:', err);
      this.presentToast('Error al cargar los cargos', 'danger');
    } finally {
      this.cd.markForCheck();
    }
  }

  filterCargos() {
    if (!this.searchTerm) {
      this.filteredCargos = this.cargos;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredCargos = this.cargos.filter(cargo =>
      cargo.nombre.toLowerCase().includes(term)
    );
    this.cd.markForCheck();
  }

  iraCrearCargo() {
    this.router.navigate(['/gestionar-cargos-instituciones/crear']);
  }

  iraEditarCargo(id: number) {
    this.router.navigate(['/gestionar-cargos-instituciones/editar', id]);
  }

  async confirmarEliminar(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Está seguro que desea eliminar este cargo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarCargo(id);
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarCargo(id: number) {
    try {
      await firstValueFrom(this.cargService.delete(id));
      this.presentToast('Cargo eliminado correctamente', 'success');
      this.loadCargos();
    } catch (err) {
      console.error('Error deleting cargo:', err);
      this.presentToast('Error al eliminar cargo', 'danger');
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
