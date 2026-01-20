import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { supabase } from 'src/supabase';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: false
})
export class EditarPage implements OnInit {

  idInstitucion: number = 0;
  institucion: any = {
    id_institucion: 0,
    nombre_institucion: '',
    direccion: '',
    telefono: '',
    email: '',
    descripcion: '',
    estado_institucion: false,
    fecha_ultima_actualizacion: null
  };

  cargando: boolean = true;
  enviando: boolean = false;
  fechaModificacion: string = 'No disponible';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.idInstitucion = Number(this.route.snapshot.paramMap.get('idInstitucion'));
    this.cargarInstitucion();
  }

  async cargarInstitucion() {
    this.cargando = true;

    const loading = await this.loadingController.create({
      message: 'Cargando información...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { data, error } = await supabase
        .from('instituciones_sistema')
        .select('*')
        .eq('id_institucion', this.idInstitucion)
        .single();

      if (error) {
        this.presentToast('Error al cargar institución: ' + error.message, 'danger');
        return;
      }

      this.institucion = data;

      // Formatear fecha para mostrar
      if (this.institucion.fecha_ultima_actualizacion) {
        const fecha = new Date(this.institucion.fecha_ultima_actualizacion);
        this.fechaModificacion = fecha.toLocaleString();
      }
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
      this.cargando = false;
    }
  }

  async actualizarInstitucion() {
    if (!this.institucion.nombre_institucion.trim()) {
      this.presentToast('El nombre de la institución es obligatorio', 'warning');
      return;
    }

    this.enviando = true;
    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const fechaActual = new Date().toISOString();

      const { data, error } = await supabase
        .from('instituciones_sistema')
        .update({
          nombre_institucion: this.institucion.nombre_institucion,
          direccion: this.institucion.direccion,
          telefono: this.institucion.telefono,
          email: this.institucion.email,
          descripcion: this.institucion.descripcion,
          estado_institucion: this.institucion.estado_institucion,
          fecha_ultima_actualizacion: fechaActual
        })
        .eq('id_institucion', this.idInstitucion);

      if (error) {
        this.presentToast('Error al actualizar institución: ' + error.message, 'danger');
        return;
      }

      this.fechaModificacion = new Date(fechaActual).toLocaleString();
      this.presentToast('Institución actualizada exitosamente', 'success');
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
