import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/services/catalogo.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
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

  private catalogoService = inject(CatalogoService);

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
      this.catalogoService.getItems('provincias').subscribe({
        next: (data) => {
          this.provincias = data.sort((a, b) => a.nombre_provincia.localeCompare(b.nombre_provincia));
        },
        error: (error) => {
          console.error('Error al obtener provincias:', error);
          this.presentToast('Error al cargar las provincias', 'danger');
        }
      });
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

      this.catalogoService.getItem('cantones', id).subscribe({
        next: async (data) => {
          await loader.dismiss();
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
        },
        error: async (error) => {
          console.error('Error al obtener canton:', error);
          await loader.dismiss();
          this.presentToast('Error al cargar el cantón', 'danger');
          this.router.navigate(['/gestionar cantones']);
        }
      });
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
    const loader = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'circles'
    });
    await loader.present();

    const { nombre_canton, codigo_canton, codigo_provincia, estado, notas } = this.cantonForm.value;

    const dataToUpdate = {
      nombre_canton,
      codigo_provincia,
      estado,
      notas,
      updated_at: new Date().toISOString(),
      updated_by: 'Usuario actual'
    };

    // Note: 'codigo_canton' is typically the ID here, so we update WHERE codigo_canton = X
    // BEWARE: If codigo_canton is changed in the form, key might change?
    // Usually IDs shouldn't be changeable. The form has 'codigo_canton' field.
    // If user changes codigo_canton, we might need to handle it carefully or forbid it.
    // Assuming for now we are using the original ID from URL or ignoring ID changes if it is the PK.
    // The previous implementation did .eq('codigo_canton', codigo_canton) where codigo_canton came from FORM.
    // If the user changed the code, this update would fail if no record matches the NEW code (unless we are creating, but this is edit).
    // Or if we are updating the record that HAS the new code (which shouldn't exist yet if unique).
    // Let's assume codigo_canton is the PK and shouldn't be changed, or if it is changed, we need the OLD id to find the record.
    // The previous code had a bug or assumed code doesn't change OR used the code as a filter.
    // If code is editable, we should use `this.route.snapshot.paramMap.get('Id_Canton')` (which we verified is verified in ngOnInit).

    // However, CatalogoService.updateItem(endpoint, ID, data) expects the ID to identify the resource.
    // We should use the ID from the URL or the loaded object, NOT the (potentially modified) form value.
    const idToUpdate = this.cantonEditado.codigo_canton;

    this.catalogoService.updateItem('cantones', idToUpdate, dataToUpdate).subscribe({
      next: async () => {
        await loader.dismiss();
        this.presentToast('Cantón actualizado exitosamente', 'success');
        setTimeout(() => {
          this.router.navigate(['/gestionar cantones']);
        }, 1000);
      },
      error: async (error) => {
        console.error('Error al actualizar canton:', error);
        await loader.dismiss();
        this.presentToast('Error al guardar los cambios: ' + (error.message || error.statusText), 'danger');
        this.isSubmitting = false;
      }
    });
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
