import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
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

  nuevaCompetencia = {
    nombre_competencias: '',
    descripcion: '',
    estado_competencia: true
  };

  enviando: boolean = false;
  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() { }

  async crearCompetencia() {
    if (!this.nuevaCompetencia.nombre_competencias.trim()) {
      this.presentToast('El nombre de la competencia es obligatorio', 'warning');
      return;
    }

    this.enviando = true;
    const loading = await this.loadingController.create({
      message: 'Guardando competencia...',
      spinner: 'crescent'
    });
    await loading.present();

    const nuevaCompetenciaData = {
      nombre_competencias: this.nuevaCompetencia.nombre_competencias,
      descripcion: this.nuevaCompetencia.descripcion || null,
      estado_competencia: this.nuevaCompetencia.estado_competencia,
      fecha_ultima_actualizacion: new Date().toISOString()
    };

    try {
      await firstValueFrom(this.catalogoService.createItem('competencias', nuevaCompetenciaData));
      this.presentToast('Competencia creada exitosamente', 'success');
      this.router.navigate(['/gestionar competencias']);
    } catch (error: any) {
      console.error('Error al crear competencia:', error);
      this.presentToast('Error al crear la competencia: ' + (error.message || error.statusText), 'danger');
    } finally {
      loading.dismiss();
      this.enviando = false;
      this.cd.markForCheck();
    }
  }

  cancelar() {
    this.router.navigate(['/gestionar-competencias']);
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
}
