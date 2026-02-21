import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { map, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditarPage implements OnInit {
  idProvincia!: number;
  provinciaForm: FormGroup;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  originalData: any = {};
  lastUpdated: Date | null = null;
  codigoOriginal: string = '';

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

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
      const data = await firstValueFrom(this.catalogoService.getItem('provincias', this.idProvincia));
      if (!data) {
        this.presentToast('Provincia no encontrada', 'danger');
        this.router.navigate(['/gestionar provincias']);
        return;
      }
      this.originalData = { ...data };
      this.codigoOriginal = data.codigo_provincia;
      this.provinciaForm.patchValue({
        nombre: data.nombre_provincia,
        codigo: data.codigo_provincia,
        estado: data.estado
      });
      if (data.updated_at) {
        this.lastUpdated = new Date(data.updated_at);
      }
    } catch (error) {
      console.error('Error al cargar provincia:', error);
      this.presentToast('No se pudo cargar la información de la provincia', 'danger');
      this.router.navigate(['/gestionar provincias']);
    } finally {
      this.isLoading = false;
      this.cd.markForCheck();
    }
  }

  async guardarCambios() {
    if (this.provinciaForm.invalid) {
      this.marcarCamposInvalidos();
      return;
    }

    this.isSubmitting = true;
    this.cd.markForCheck();

    try {
      // Check for duplicate code if code changed
      if (this.provinciaForm.value.codigo !== this.codigoOriginal) {
        const provincias = await firstValueFrom(this.catalogoService.getItems('provincias'));
        const existing = provincias.find((p: any) =>
          p.codigo_provincia === this.provinciaForm.value.codigo && p.id_provincia !== this.idProvincia
        );

        if (existing) {
          this.presentAlert(
            'Código duplicado',
            `Ya existe otra provincia con el código "${this.provinciaForm.value.codigo}". Por favor, utilice otro código.`
          );
          this.isSubmitting = false;
          this.cd.markForCheck();
          return;
        }
      }

      await this.procederGuardar();
    } catch (error) {
      console.error('Error al verificar duplicados:', error);
      this.presentToast('Error al verificar duplicados. Intente nuevamente.', 'danger');
      this.isSubmitting = false;
      this.cd.markForCheck();
    }
  }

  async procederGuardar() {
    const dataToUpdate = {
      nombre_provincia: this.provinciaForm.value.nombre,
      codigo_provincia: this.provinciaForm.value.codigo,
      estado: this.provinciaForm.value.estado,
      updated_at: new Date().toISOString()
    };

    try {
      await firstValueFrom(this.catalogoService.updateItem('provincias', this.idProvincia, dataToUpdate));
      this.presentToast(`Provincia "${this.provinciaForm.value.nombre}" actualizada correctamente`, 'success');
      this.router.navigate(['/gestionar provincias']);
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      this.presentToast('Error al actualizar la provincia. Por favor, intente nuevamente.', 'danger');
    } finally {
      this.isSubmitting = false;
      this.cd.markForCheck();
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
      this.provinciaForm.value.nombre !== this.originalData.nombre_provincia ||
      this.provinciaForm.value.codigo !== this.originalData.codigo_provincia ||
      this.provinciaForm.value.estado !== this.originalData.estado
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
