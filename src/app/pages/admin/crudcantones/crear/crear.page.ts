import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { supabase } from 'src/supabase';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: false
})
export class CrearPage implements OnInit {

  provincias: any[] = [];
  cantonForm: FormGroup;
  submitted = false;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.cantonForm = this.formBuilder.group({
      nombre_canton: ['', [Validators.required]],
      codigo_canton: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      codigo_provincia: ['', [Validators.required]],
      estado: [true],
      notas: [''] // Campo adicional opcional
    });
  }

  ngOnInit() {
    this.obtenerProvincias();
  }

  get f() { return this.cantonForm.controls; }

  async obtenerProvincias() {
    try {
      const loader = await this.loadingController.create({
        message: 'Cargando provincias...',
        spinner: 'circles'
      });
      await loader.present();

      let { data: Provincias, error } = await supabase
        .from('Provincias')
        .select('Codigo_Provincia, Nombre_Provincia')
        .order('Nombre_Provincia', { ascending: true });

      await loader.dismiss();

      if (error) {
        console.error('Error al obtener las provincias', error);
        this.presentToast('Error al cargar las provincias', 'danger');
        return;
      }

      this.provincias = Provincias || [];

    } catch (error) {
      console.error('Error inesperado:', error);
      this.presentToast('Error al cargar los datos', 'danger');
    }
  }

  async crearCanton() {
    this.submitted = true;

    // Detener si el formulario es inválido
    if (this.cantonForm.invalid) {
      this.presentToast('Por favor, complete todos los campos requeridos', 'warning');
      return;
    }

    this.isSubmitting = true;

    try {
      const loader = await this.loadingController.create({
        message: 'Guardando cantón...',
        spinner: 'circles'
      });
      await loader.present();

      // Extraer valores del formulario
      const { nombre_canton, codigo_canton, codigo_provincia, estado, notas } = this.cantonForm.value;

      // Verificar si ya existe un cantón con el mismo código
      let { data: existingCantons, error: checkError } = await supabase
        .from('Cantones')
        .select('codigo_canton')
        .eq('codigo_canton', codigo_canton);

      if (checkError) {
        throw checkError;
      }

      if (existingCantons && existingCantons.length > 0) {
        await loader.dismiss();
        this.presentAlert(
          'Código duplicado',
          `Ya existe un cantón con el código ${codigo_canton}. Por favor, utilice un código diferente.`
        );
        this.isSubmitting = false;
        return;
      }

      // Guardar los datos en Supabase
      let { data, error } = await supabase
        .from('Cantones')
        .insert([
          {
            nombre_canton,
            codigo_canton,
            codigo_provincia,
            estado,
            notas // Campo adicional
          }
        ]);

      await loader.dismiss();

      if (error) {
        throw error;
      }

      // Mostrar mensaje de éxito
      this.presentToast('Cantón creado exitosamente', 'success');

      // Redireccionar a la página de listado
      setTimeout(() => {
        this.router.navigate(['/gestionar cantones']);
      }, 1000);

    } catch (error: any) {
      console.error('Error al crear el cantón:', error);
      this.presentToast('Error al guardar el cantón: ' + (error.message || 'Error desconocido'), 'danger');
      this.isSubmitting = false;
    }
  }

  cancelar() {
    // Si hay cambios, preguntar antes de salir
    if (this.cantonForm.dirty) {
      this.confirmarSalida();
    } else {
      this.router.navigate(['/gestionar cantones']);
    }
  }

  async confirmarSalida() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea salir? Los cambios no guardados se perderán.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Salir',
          handler: () => {
            this.router.navigate(['/gestionar cantones']);
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'bottom',
      color: color,
      buttons: [
        {
          text: 'Cerrar',
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
      buttons: ['Aceptar']
    });

    await alert.present();
  }
}
