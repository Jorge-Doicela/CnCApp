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

  idCompetencia: number = 0;
  competencia: any = {
    id_competencias: 0,
    nombre_competencias: '',
    descripcion: '',
    estado_competencia: false,
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
    this.idCompetencia = Number(this.route.snapshot.paramMap.get('idCompetencia'));
    this.cargarCompetencia();
  }

  async cargarCompetencia() {
    this.cargando = true;

    const loading = await this.loadingController.create({
      message: 'Cargando información...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { data, error } = await supabase
        .from('competencias')
        .select('*')
        .eq('id_competencias', this.idCompetencia)
        .single();

      if (error) {
        this.presentToast('Error al cargar competencia: ' + error.message, 'danger');
        return;
      }

      this.competencia = data;

      // Formatear fecha para mostrar
      if (this.competencia.fecha_ultima_actualizacion) {
        const fecha = new Date(this.competencia.fecha_ultima_actualizacion);
        this.fechaModificacion = fecha.toLocaleString();
      }
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
      this.cargando = false;
    }
  }

  async actualizarCompetencia() {
    if (!this.competencia.nombre_competencias.trim()) {
      this.presentToast('El nombre de la competencia es obligatorio', 'warning');
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
        .from('competencias')
        .update({
          nombre_competencias: this.competencia.nombre_competencias,
          descripcion: this.competencia.descripcion,
          estado_competencia: this.competencia.estado_competencia,
          fecha_ultima_actualizacion: fechaActual
        })
        .eq('id_competencias', this.idCompetencia);

      if (error) {
        this.presentToast('Error al actualizar competencia: ' + error.message, 'danger');
        return;
      }

      this.fechaModificacion = new Date(fechaActual).toLocaleString();
      this.presentToast('Competencia actualizada exitosamente', 'success');
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
