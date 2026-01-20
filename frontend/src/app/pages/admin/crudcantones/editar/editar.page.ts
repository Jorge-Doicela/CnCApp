import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { supabase } from 'src/supabase';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: false
})
export class EditarPage implements OnInit {

  cantonEditado: any = {
    id: null,
    nombre_canton: '',
    codigo_canton: '',
    codigo_provincia: '',
    estado: false,
    notas: ''
  };

  provincias: any[] = [];
  cantonForm: FormGroup;
  submitted = false;
  isSubmitting = false;
  cargando = true;

  // Para el historial de cambios (simulado)
  mostrarHistorial = false;
  fechaUltimaModificacion: Date | null = null;
  usuarioUltimaModificacion: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.cantonForm = this.formBuilder.group({
      nombre_canton: ['', [Validators.required]],
      codigo_canton: ['', [Validators.required]],
      codigo_provincia: ['', [Validators.required]],
      estado: [false],
      notas: ['']
    });
  }

  async ngOnInit() {
    await this.obtenerProvincias();

    // Obtenemos el ID del canton desde la URL
    const idCanton = this.route.snapshot.paramMap.get('Id_Canton');
    if (idCanton) {
      await this.obtenerCantonPorId(idCanton);
    } else {
      this.cargando = false;
      this.presentToast('Error: No se especificó un ID de cantón válido', 'danger');
      this.router.navigate(['/gestionar cantones']);
    }
  }

  get f() { return this.cantonForm.controls; }

  async obtenerProvincias() {
    try {
      let { data: Provincias, error } = await supabase
        .from('Provincias')
        .select('Codigo_Provincia, Nombre_Provincia')
        .order('Nombre_Provincia', { ascending: true });

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

  // Obtener canton por ID
  async obtenerCantonPorId(id: string) {
    try {
      const loader = await this.loadingController.create({
        message: 'Cargando información del cantón...',
        spinner: 'circles'
      });
      await loader.present();

      let { data, error } = await supabase
        .from('Cantones')
        .select('*')
        .eq('codigo_canton', id)
        .single();

      await loader.dismiss();

      if (error) {
        console.error('Error al obtener el canton:', error);
        this.presentToast('Error al cargar el cantón', 'danger');
        this.router.navigate(['/gestionar cantones']);
        return;
      }

      if (!data) {
        this.presentToast('El cantón solicitado no existe', 'warning');
        this.router.navigate(['/gestionar cantones']);
        return;
      }

      this.cantonEditado = data;

      // Simulación de datos de historial
      this.mostrarHistorial = true;
      this.fechaUltimaModificacion = new Date(data.updated_at || Date.now());
      this.usuarioUltimaModificacion = data.updated_by || 'Usuario del sistema';

      // Actualizar el formulario con los datos del cantón
      this.cantonForm.patchValue({
        nombre_canton: data.nombre_canton,
        codigo_canton: data.codigo_canton,
        codigo_provincia: data.codigo_provincia,
        estado: data.estado,
        notas: data.notas || ''
      });

      this.cargando = false;

    } catch (error) {
      console.error('Error inesperado:', error);
      this.presentToast('Error al cargar los datos del cantón', 'danger');
      this.cargando = false;
    }
  }

  // Guardar cambios al editar el canton
  async guardarCanton() {
    this.submitted = true;

    // Detener si el formulario es inválido
    if (this.cantonForm.invalid) {
      this.presentToast('Por favor, complete todos los campos requeridos', 'warning');
      return;
    }

    // Si no hay cambios, no hacer nada
    if (!this.cantonForm.dirty) {
      this.presentToast('No se han realizado cambios en el cantón', 'warning');
      return;
    }

    this.isSubmitting = true;

    try {
      const loader = await this.loadingController.create({
        message: 'Guardando cambios...',
        spinner: 'circles'
      });
      await loader.present();

      const { nombre_canton, codigo_canton, codigo_provincia, estado, notas } = this.cantonForm.value;

      let { data, error } = await supabase
        .from('Cantones')
        .update({
          nombre_canton,
          codigo_provincia,
          estado,
          notas,
          updated_at: new Date().toISOString(),
          updated_by: 'Usuario actual' // Aquí podrías poner el nombre o ID del usuario logeado
        })
        .eq('codigo_canton', codigo_canton);

      await loader.dismiss();

      if (error) {
        throw error;
      }

      // Mostrar mensaje de éxito
      this.presentToast('Cantón actualizado exitosamente', 'success');

      // Redireccionar a la página de listado
      setTimeout(() => {
        this.router.navigate(['/gestionar cantones']);
      }, 1000);

    } catch (error: any) {
      console.error('Error al actualizar el cantón:', error);
      this.presentToast('Error al guardar los cambios: ' + (error.message || 'Error desconocido'), 'danger');
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
}
