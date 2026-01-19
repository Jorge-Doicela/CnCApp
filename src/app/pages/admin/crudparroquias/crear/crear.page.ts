import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: false
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
    } finally {
      loading.dismiss();
    }
  }

  async validarCodigoExistente() {
    try {
      const { data, error } = await supabase
        .from('parroquia')
        .select('codigo_parroquia')
        .eq('codigo_parroquia', this.nuevaParroquia.codigo_parroquia)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Error diferente a "no se encontró el registro"
        this.presentToast('Error al validar código: ' + error.message, 'danger');
        return true;
      }

      if (data) {
        this.presentToast('El código de parroquia ya existe. Por favor, utilice otro código.', 'warning');
        return true;
      }

      return false;
    } catch (error: any) {
      this.presentToast('Error en la validación: ' + error.message, 'danger');
      return true;
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

    try {
      const { codigo_parroquia, nombre_parroquia, codigo_canton, estado } = this.nuevaParroquia;

      // Validación adicional de campos
      if (!codigo_parroquia || !nombre_parroquia || !codigo_canton) {
        this.presentToast('Todos los campos marcados con * son obligatorios', 'warning');
        return;
      }

      // Insertar la nueva parroquia en la base de datos
      const { data, error } = await supabase
        .from('parroquia')
        .insert([{
          codigo_parroquia,
          nombre_parroquia,
          codigo_canton,
          estado
        }]);

      if (error) {
        this.presentToast('Error al crear la parroquia: ' + error.message, 'danger');
        return;
      }

      this.presentAlert('Éxito', 'Parroquia creada correctamente');
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
