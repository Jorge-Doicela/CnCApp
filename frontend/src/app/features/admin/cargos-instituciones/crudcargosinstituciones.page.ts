import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonItem, IonLabel, IonButton, IonIcon,
  IonList, IonInput, AlertController, ToastController,
  IonCardSubtitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline, createOutline, trashOutline,
  searchOutline, briefcaseOutline
} from 'ionicons/icons';
import { CargService, Cargo } from './services/cargos.service';

@Component({
  selector: 'app-crudcargosinstituciones',
  templateUrl: './crudcargosinstituciones.page.html',
  styleUrls: ['./crudcargosinstituciones.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonItem, IonLabel, IonButton, IonIcon,
    IonList, IonInput, IonCardSubtitle
  ]
})
export class CrudcargosinstitucionesPage implements OnInit {
  cargos: Cargo[] = [];
  filteredCargos: Cargo[] = [];
  searchTerm: string = '';

  constructor(
    private cargService: CargService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      'add-circle-outline': addCircleOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'search-outline': searchOutline,
      'briefcase-outline': briefcaseOutline
    });
  }

  ngOnInit() {
    this.ionViewWillEnter();
  }

  ionViewWillEnter() {
    this.loadCargos();
  }

  loadCargos() {
    this.cargService.getAll().subscribe({
      next: (data) => {
        this.cargos = data;
        this.filterCargos();
      },
      error: (err) => {
        console.error('Error loading cargos:', err);
        this.presentToast('Error al cargar los cargos', 'danger');
      }
    });
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

  eliminarCargo(id: number) {
    this.cargService.delete(id).subscribe({
      next: () => {
        this.presentToast('Cargo eliminado correctamente', 'success');
        this.loadCargos();
      },
      error: (err) => {
        console.error('Error deleting cargo:', err);
        this.presentToast('Error al eliminar cargo', 'danger');
      }
    });
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
