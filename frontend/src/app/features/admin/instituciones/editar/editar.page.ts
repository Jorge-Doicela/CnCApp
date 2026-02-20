import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  createOutline,
  keyOutline,
  businessOutline,
  informationCircleOutline,
  saveOutline,
  closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditarPage implements OnInit {

  idInstitucion: number = 0;
  institucion: any = {
    id: 0,
    nombre: '',
    tipo: ''
  };

  cargando: boolean = true;
  enviando: boolean = false;

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({
      createOutline,
      keyOutline,
      businessOutline,
      informationCircleOutline,
      saveOutline,
      closeOutline
    });
  }

  ngOnInit() {
    this.idInstitucion = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarInstitucion();
  }

  async cargarInstitucion() {
    this.cargando = true;
    this.cd.markForCheck();

    try {
      if (!this.idInstitucion) {
        await this.presentToast('ID de institución no válido.', 'danger');
        this.router.navigate(['/gestionar-instituciones']);
        return;
      }

      const data = await firstValueFrom(this.catalogoService.getItem('instituciones', this.idInstitucion));

      if (!data) {
        await this.presentToast('No se encontró la institución.', 'danger');
        this.router.navigate(['/gestionar-instituciones']);
        return;
      }

      this.institucion = data;
    } catch (error: any) {
      console.error('Error al cargar institución:', error);
      await this.presentToast('Error al cargar institución: ' + (error?.message ?? ''), 'danger');
    } finally {
      this.cargando = false;
      this.cd.markForCheck();
    }
  }

  async actualizarInstitucion() {
    if (!this.institucion.nombre?.trim()) {
      await this.presentToast('El nombre de la institución es obligatorio', 'warning');
      return;
    }

    this.enviando = true;
    this.cd.markForCheck();

    try {
      const dataToUpdate = {
        nombre: this.institucion.nombre,
        tipo: this.institucion.tipo
      };

      await firstValueFrom(this.catalogoService.updateItem('instituciones', this.idInstitucion, dataToUpdate));
      await this.presentToast('Institución actualizada exitosamente', 'success');
      this.router.navigate(['/gestionar-instituciones']);
    } catch (error: any) {
      console.error('Error al actualizar institución:', error);
      await this.presentToast('Error al actualizar institución: ' + (error?.message ?? ''), 'danger');
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
