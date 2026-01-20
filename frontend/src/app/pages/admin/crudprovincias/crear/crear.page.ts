// crear.page.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { supabase } from 'src/supabase';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: false,
})
export class CrearPage implements OnInit {
  provinciaForm: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.provinciaForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigo: ['', [Validators.required, Validators.minLength(2)]],
      estado: [true]
    });
  }

  ngOnInit() {}

  async crearProvincia() {
    if (this.provinciaForm.invalid) {
      this.marcarCamposInvalidos();
      return;
    }

    this.isSubmitting = true;

    try {
      // Verificar si ya existe una provincia con el mismo código
      const { data: existingData, error: existingError } = await supabase
        .from('Provincias')
        .select('*')
        .eq('Codigo_Provincia', this.provinciaForm.value.codigo)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingData) {
        this.presentAlert(
          'Código duplicado',
          `Ya existe una provincia con el código "${this.provinciaForm.value.codigo}". Por favor, utilice otro código.`
        );
        this.isSubmitting = false;
        return;
      }

      // Crear la provincia
      const { data, error } = await supabase
        .from('Provincias')
        .insert([
          {
            Nombre_Provincia: this.provinciaForm.value.nombre,
            Codigo_Provincia: this.provinciaForm.value.codigo,
            Estado: this.provinciaForm.value.estado
          }
        ]);

      if (error) {
        throw error;
      }

      this.presentToast(`Provincia "${this.provinciaForm.value.nombre}" creada exitosamente`, 'success');
      this.router.navigate(['/gestionar provincias']);
    } catch (error) {
      console.error('Error al crear la provincia:', error);
      this.presentToast('Error al crear la provincia. Por favor, intente nuevamente.', 'danger');
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
    if (this.provinciaForm.dirty) {
      this.confirmarCancelar();
    } else {
      this.router.navigate(['/gestionar provincias']);
    }
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
