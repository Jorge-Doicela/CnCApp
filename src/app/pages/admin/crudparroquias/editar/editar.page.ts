import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from 'src/supabase';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: false
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

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
  }

  async obtenerParroquia(id: string) {
    const loading = await this.loadingController.create({
      message: 'Cargando información...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      let { data, error } = await supabase
        .from('parroquia')
        .select('*')
        .eq('codigo_parroquia', id)
        .single();

      if (error) {
        this.presentToast('Error al obtener parroquia: ' + error.message, 'danger');
        this.router.navigate(['/crudparroquias']);
        return;
      }

      if (!data) {
        this.presentToast('No se encontró la parroquia', 'warning');
        this.router.navigate(['/crudparroquias']);
        return;
      }

      this.parroquia = data;
      this.fechaModificacion = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async obtenerCantones() {
    try {
      let { data: Cantones, error } = await supabase
        .from('Cantones')
        .select('*')
        .order('nombre_canton', { ascending: true });

      if (error) {
        this.presentToast('Error al obtener cantones: ' + error.message, 'danger');
        return;
      }

      this.cantones = Cantones || [];
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    }
  }

  async actualizarParroquia() {
    this.enviando = true;
    const loading = await this.loadingController.create({
      message: 'Actualizando parroquia...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { codigo_parroquia, nombre_parroquia, codigo_canton, estado } = this.parroquia;

      // Validación de campos
      if (!codigo_parroquia || !nombre_parroquia || !codigo_canton) {
        this.presentToast('Todos los campos marcados con * son obligatorios', 'warning');
        return;
      }

      // Actualizar la parroquia
      let { error } = await supabase
        .from('parroquia')
        .update({
          nombre_parroquia,
          codigo_canton,
          estado
        })
        .eq('codigo_parroquia', this.idParroquia);

      if (error) {
        this.presentToast('Error al actualizar parroquia: ' + error.message, 'danger');
        return;
      }

      this.presentAlert('Éxito', 'Parroquia actualizada correctamente');
      this.router.navigate(['/crudparroquias']);
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
      this.enviando = false;
    }
  }

  cancelar() {
    this.router.navigate(['/crudparroquias']);
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
