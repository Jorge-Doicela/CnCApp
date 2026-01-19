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

  nuevaInstitucion = {
    nombre_institucion: '',
    direccion: '',
    telefono: '',
    email: '',
    descripcion: '',
    estado_institucion: true
  };

  enviando: boolean = false;

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() { }

  async crearInstitucion() {
    if (!this.nuevaInstitucion.nombre_institucion.trim()) {
      this.presentToast('El nombre de la institución es obligatorio', 'warning');
      return;
    }

    this.enviando = true;
    const loading = await this.loadingController.create({
      message: 'Guardando institución...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { data, error } = await supabase
        .from('instituciones_sistema')
        .insert([
          {
            nombre_institucion: this.nuevaInstitucion.nombre_institucion,
            direccion: this.nuevaInstitucion.direccion || null,
            telefono: this.nuevaInstitucion.telefono || null,
            email: this.nuevaInstitucion.email || null,
            descripcion: this.nuevaInstitucion.descripcion || null,
            estado_institucion: this.nuevaInstitucion.estado_institucion,
            fecha_ultima_actualizacion: new Date().toISOString()
          }
        ]);

      if (error) {
        this.presentToast('Error al crear la institución: ' + error.message, 'danger');
        return;
      }

      this.presentToast('Institución creada exitosamente', 'success');
      this.router.navigate(['/gestionar instituciones']);
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
      this.enviando = false;
    }
  }

  cancelar() {
    this.router.navigate(['/gestionar instituciones']);
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
