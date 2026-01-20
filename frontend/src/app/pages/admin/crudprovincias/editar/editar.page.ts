import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { supabase } from 'src/supabase';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: false
})
export class EditarPage implements OnInit {
  idProvincia!: number;
  provinciaForm: FormGroup;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  originalData: any = {};
  lastUpdated: Date | null = null;
  codigoOriginal: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.provinciaForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigo: ['', [Validators.required, Validators.minLength(2)]],
      estado: [false]
    });
  }

  ngOnInit() {
    // Obtener el ID de la provincia desde la URL
    const idParam = this.route.snapshot.paramMap.get('Id_Provincia');
    if (idParam) {
      this.idProvincia = Number(idParam);
      this.cargarProvincia();
    } else {
      this.presentAlert('Error', 'No se pudo encontrar el ID de la provincia.');
      this.router.navigate(['/gestionar provincias']);
    }
  }

  async cargarProvincia() {
    this.isLoading = true;

    try {
      const { data, error } = await supabase
        .from('Provincias')
        .select('*')
        .eq('IdProvincia', this.idProvincia)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Provincia no encontrada');
      }

      // Guardar datos originales para comparar cambios
      this.originalData = { ...data };
      this.codigoOriginal = data.Codigo_Provincia;

      // Actualizar el formulario con los datos obtenidos
      this.provinciaForm.patchValue({
        nombre: data.Nombre_Provincia,
        codigo: data.Codigo_Provincia,
        estado: data.Estado
      });

      // Establecer la última actualización si está disponible
      if (data.updated_at) {
        this.lastUpdated = new Date(data.updated_at);
      }
    } catch (error) {
      console.error('Error al cargar provincia:', error);
      this.presentToast('No se pudo cargar la información de la provincia', 'danger');
      this.router.navigate(['/gestionar provincias']);
    } finally {
      this.isLoading = false;
    }
  }

  async guardarCambios() {
    if (this.provinciaForm.invalid) {
      this.marcarCamposInvalidos();
      return;
    }

    this.isSubmitting = true;

    try {
      // Verificar si el código ha cambiado y si ya existe
      if (this.provinciaForm.value.codigo !== this.codigoOriginal) {
        const { data: existingData, error: existingError } = await supabase
          .from('Provincias')
          .select('*')
          .eq('Codigo_Provincia', this.provinciaForm.value.codigo)
          .neq('IdProvincia', this.idProvincia)
          .maybeSingle();

        if (existingError) {
          throw existingError;
        }

        if (existingData) {
          this.presentAlert(
            'Código duplicado',
            `Ya existe otra provincia con el código "${this.provinciaForm.value.codigo}". Por favor, utilice otro código.`
          );
          this.isSubmitting = false;
          return;
        }
      }

      // Actualizar la provincia
      const { data, error } = await supabase
        .from('Provincias')
        .update({
          Nombre_Provincia: this.provinciaForm.value.nombre,
          Codigo_Provincia: this.provinciaForm.value.codigo,
          Estado: this.provinciaForm.value.estado,
          updated_at: new Date().toISOString()
        })
        .eq('IdProvincia', this.idProvincia);

      if (error) {
        throw error;
      }

      this.presentToast(`Provincia "${this.provinciaForm.value.nombre}" actualizada correctamente`, 'success');
      this.router.navigate(['/gestionar provincias']);
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      this.presentToast('Error al actualizar la provincia. Por favor, intente nuevamente.', 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  marcarCamposInvalidos() {
    Object.keys(this.provinciaForm.controls).forEach(field => {
      const control = this.provinciaForm.get(field);
      control?.markAsTouched();
    });
    this.presentToast('Por favor, complete correctamente todos los campos requeridos', 'warning');
  }

  cancelar() {
    if (this.hayCambios()) {
      this.confirmarCancelar();
    } else {
      this.router.navigate(['/gestionar provincias']);
    }
  }

  hayCambios(): boolean {
    return (
      this.provinciaForm.value.nombre !== this.originalData.Nombre_Provincia ||
      this.provinciaForm.value.codigo !== this.originalData.Codigo_Provincia ||
      this.provinciaForm.value.estado !== this.originalData.Estado
    );
  }

  async confirmarCancelar() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea cancelar? Los cambios no guardados se perderán.',
      buttons: [
        {
          text: 'No, continuar editando',
          role: 'cancel'
        },
        {
          text: 'Sí, cancelar',
          handler: () => {
            this.router.navigate(['/gestionar provincias']);
          }
        }
      ]
    });

    await alert.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['Aceptar']
    });

    await alert.present();
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
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
