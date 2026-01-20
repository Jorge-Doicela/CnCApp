import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { supabase } from 'src/supabase';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: false
})
export class CrearPage implements OnInit {

  nuevaCompetencia = {
    nombre_competencias: '',
    descripcion: '',
    estado_competencia: true
  };

  enviando: boolean = false;

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

    try {
      const { data, error } = await supabase
        .from('competencias')
        .insert([
          {
            nombre_competencias: this.nuevaCompetencia.nombre_competencias,
            descripcion: this.nuevaCompetencia.descripcion || null,
            estado_competencia: this.nuevaCompetencia.estado_competencia,
            fecha_ultima_actualizacion: new Date().toISOString()
          }
        ]);

      if (error) {
        this.presentToast('Error al crear la competencia: ' + error.message, 'danger');
        return;
      }

      this.presentToast('Competencia creada exitosamente', 'success');
      this.router.navigate(['/gestionar competencias']);
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
      this.enviando = false;
    }
  }

  cancelar() {
    this.router.navigate(['/gestionar competencias']);
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
