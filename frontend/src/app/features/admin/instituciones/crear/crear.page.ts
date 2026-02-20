import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  businessOutline,
  informationCircleOutline,
  saveOutline,
  closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearPage {

  nuevaInstitucion = {
    nombre: '',
    tipo: ''
  };

  enviando: boolean = false;
  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({
      addCircleOutline,
      businessOutline,
      informationCircleOutline,
      saveOutline,
      closeOutline
    });
  }

  async crearInstitucion() {
    if (!this.nuevaInstitucion.nombre.trim()) {
      await this.presentToast('El nombre de la institución es obligatorio', 'warning');
      return;
    }

    this.enviando = true;
    this.cd.markForCheck();

    try {
      const data = {
        nombre: this.nuevaInstitucion.nombre,
        tipo: this.nuevaInstitucion.tipo || null
      };

      await firstValueFrom(this.catalogoService.createItem('instituciones', data));
      await this.presentToast('Institución creada exitosamente', 'success');
      this.router.navigate(['/gestionar-instituciones']);
    } catch (error: any) {
      console.error('Error al crear institución:', error);
      await this.presentToast('Error al crear la institución: ' + (error?.message ?? ''), 'danger');
    } finally {
      this.enviando = false;
      this.cd.markForCheck();
    }
  }

  cancelar() {
    this.router.navigate(['/gestionar-instituciones']);
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }
}
