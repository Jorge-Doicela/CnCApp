import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditarPage implements OnInit {

  idParroquia: string | null = null;
  parroquia = {
    codigo_parroquia: '',
    nombre_parroquia: '',
    codigo_canton: '',
    estado: true
  };

  cantones: any[] = [];
  cargando: boolean = true;
  enviando: boolean = false;
  fechaModificacion: string = 'No disponible';

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.idParroquia = this.route.snapshot.paramMap.get('Id_Parroquia');

    if (this.idParroquia) {
      this.cargarDatos();
    } else {
      this.presentToast('ID de parroquia no válido', 'danger');
      this.router.navigate(['/crudparroquias']);
    }
  }

  async cargarDatos() {
    this.cargando = true;
    await this.obtenerCantones();
    await this.obtenerParroquia(this.idParroquia!);
    this.cargando = false;
    this.cd.markForCheck();
  }

  async obtenerParroquia(id: string) {
    const loading = await this.loadingController.create({
      message: 'Cargando información...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const data = await firstValueFrom(this.catalogoService.getItem('parroquias', id));
      if (!data) {
        this.presentToast('No se encontró la parroquia', 'warning');
        this.router.navigate(['/crudparroquias']);
        return;
      }
      this.parroquia = data;
      this.fechaModificacion = new Date().toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (error: any) {
      this.presentToast('Error al obtener parroquia: ' + (error.message || error.statusText), 'danger');
      this.router.navigate(['/crudparroquias']);
    } finally {
      loading.dismiss();
      this.cd.markForCheck();
    }
  }

  async obtenerCantones() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('cantones'));
      this.cantones = data.sort((a, b) => a.nombre_canton.localeCompare(b.nombre_canton));
    } catch (error: any) {
      this.presentToast('Error al obtener cantones: ' + (error.message || error.statusText), 'danger');
    }
  }

  async actualizarParroquia() {
    this.enviando = true;
    const loading = await this.loadingController.create({
      message: 'Actualizando parroquia...',
      spinner: 'crescent'
    });
    await loading.present();

    const { codigo_parroquia, nombre_parroquia, codigo_canton, estado } = this.parroquia;

    // Validación de campos
    if (!codigo_parroquia || !nombre_parroquia || !codigo_canton) {
      loading.dismiss();
      this.enviando = false;
      this.presentToast('Todos los campos marcados con * son obligatorios', 'warning');
      return;
    }

    const dataToUpdate = {
      nombre_parroquia,
      codigo_canton,
      estado
    };

    // Use ID from URL
    try {
      await firstValueFrom(this.catalogoService.updateItem('parroquias', this.idParroquia!, dataToUpdate));
      this.presentAlert('Éxito', 'Parroquia actualizada correctamente');
      this.router.navigate(['/crudparroquias']);
    } catch (error: any) {
      this.presentToast('Error al actualizar parroquia: ' + (error.message || error.statusText), 'danger');
    } finally {
      loading.dismiss();
      this.enviando = false;
      this.cd.markForCheck();
    }
  }

  cancelar() {
    this.router.navigate(['/gestionar-parroquias']);
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
      buttons: [
        {
          side: 'end',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
