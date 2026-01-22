import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
})
export class CrearPage implements OnInit {
  provinciaForm: FormGroup;
  isSubmitting: boolean = false;
  private catalogoService = inject(CatalogoService);

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

  ngOnInit() { }

  async crearProvincia() {
    if (this.provinciaForm.invalid) {
      this.marcarCamposInvalidos();
      return;
    }

    this.isSubmitting = true;

    // Verificar si ya existe una provincia con el mismo código
    this.catalogoService.getItems('provincias').pipe(
      map(provincias => provincias.find((p: any) => p.codigo_provincia === this.provinciaForm.value.codigo))
    ).subscribe({
      next: (existing) => {
        if (existing) {
          this.presentAlert(
            'Código duplicado',
            `Ya existe una provincia con el código "${this.provinciaForm.value.codigo}". Por favor, utilice otro código.`
          );
          this.isSubmitting = false;
          return;
        }

        this.guardarProvincia();
      },
      error: (error) => {
        console.error('Error al verificar duplicados:', error);
        this.presentToast('Error al verificar duplicados. Intente nuevamente.', 'danger');
        this.isSubmitting = false;
      }
    });
  }

  guardarProvincia() {
    const nuevaProvincia = {
      nombre_provincia: this.provinciaForm.value.nombre,
      codigo_provincia: this.provinciaForm.value.codigo,
      estado: this.provinciaForm.value.estado
    };

    this.catalogoService.createItem('provincias', nuevaProvincia).subscribe({
      next: () => {
        this.presentToast(`Provincia "${this.provinciaForm.value.nombre}" creada exitosamente`, 'success');
        this.router.navigate(['/gestionar provincias']);
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error al crear la provincia:', error);
        this.presentToast('Error al crear la provincia: ' + (error.message || error.statusText), 'danger');
        this.isSubmitting = false;
      }
    });
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
