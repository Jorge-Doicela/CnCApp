import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearPage implements OnInit {

  // Modelo para la nueva parroquia
  nuevaParroquia = {
    codigo_parroquia: '',
    nombre_parroquia: '',
    codigo_canton: '',
    estado: true
  };

  cantones: any[] = [];
  enviando: boolean = false;

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.obtenerCantones();
  }

  async obtenerCantones() {
    const loading = await this.loadingController.create({
      message: 'Cargando cantones...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const data = await firstValueFrom(this.catalogoService.getItems('cantones'));
      this.cantones = data.sort((a: any, b: any) => a.nombre_canton.localeCompare(b.nombre_canton));
    } catch (error) {
      console.error('Error al obtener cantones:', error);
      this.presentToast('Error al obtener cantones.', 'danger');
    } finally {
      loading.dismiss();
      this.cd.markForCheck();
    }
  }

  async validarCodigoExistente(): Promise<boolean> {
    try {
      const parroquias = await firstValueFrom(this.catalogoService.getItems('parroquias'));
      const existing = parroquias.find((p: any) => p.codigo_parroquia === this.nuevaParroquia.codigo_parroquia);
      if (existing) {
        this.presentToast('El código de parroquia ya existe. Por favor, utilice otro código.', 'warning');
        return true;
      }
      return false;
    } catch (error: any) {
      this.presentToast('Error al validar código: ' + error.message, 'danger');
      return true; // Fail safe
    }
  }

  async crearParroquia() {
    // Verificar si el código ya existe
    const codigoExiste = await this.validarCodigoExistente();
    if (codigoExiste) return;

    this.enviando = true;
    const loading = await this.loadingController.create({
      message: 'Guardando parroquia...',
      spinner: 'crescent'
    });
    await loading.present();

    const { codigo_parroquia, nombre_parroquia, codigo_canton, estado } = this.nuevaParroquia;

    // Validación adicional de campos
    if (!codigo_parroquia || !nombre_parroquia || !codigo_canton) {
      loading.dismiss();
      this.enviando = false;
      this.presentToast('Todos los campos marcados con * son obligatorios', 'warning');
      return;
    }

    // Insertar la nueva parroquia
    try {
      await firstValueFrom(this.catalogoService.createItem('parroquias', this.nuevaParroquia));
      this.presentAlert('Éxito', 'Parroquia creada correctamente');
      this.router.navigate(['/gestionar-parroquias']);
    } catch (error: any) {
      this.presentToast('Error al crear la parroquia: ' + (error.message || error.statusText), 'danger');
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
