import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class CrearPage implements OnInit {

  provincias: any[] = [];
  cantonForm: FormGroup;
  submitted = false;
  isSubmitting = false;

  private catalogoService = inject(CatalogoService);

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

  async crearCanton() {
    this.submitted = true;

    // Detener si el formulario es inválido
    if (this.cantonForm.invalid) {
      this.presentToast('Por favor, complete todos los campos requeridos', 'warning');
      return;
    }

    this.isSubmitting = true;

    const loader = await this.loadingController.create({
      message: 'Guardando cantón...',
      spinner: 'circles'
    });
    await loader.present();

    // Check for duplicate code
    this.catalogoService.getItems('cantones').pipe(
      map(cantones => cantones.find((c: any) => c.codigo_canton === this.cantonForm.value.codigo_canton))
    ).subscribe({
      next: async (existing) => {
        if (existing) {
          await loader.dismiss();
          this.presentAlert(
            'Código duplicado',
            `Ya existe un cantón con el código ${this.cantonForm.value.codigo_canton}. Por favor, utilice un código diferente.`
          );
          this.isSubmitting = false;
          return;
        }
        this.guardarCanton(loader);
      },
      error: async (error) => {
        console.error('Error al verificar duplicados:', error);
        await loader.dismiss();
        this.presentToast('Error al verificar duplicados. Intente nuevamente.', 'danger');
        this.isSubmitting = false;
      }
    });
  }

  guardarCanton(loader: HTMLIonLoadingElement) {
    const { nombre_canton, codigo_canton, codigo_provincia, estado, notas } = this.cantonForm.value;

    const nuevoCanton = {
      nombre_canton,
      codigo_canton,
      codigo_provincia,
      estado,
      notas
    };

    this.catalogoService.createItem('cantones', nuevoCanton).subscribe({
      next: async () => {
        await loader.dismiss();
        this.presentToast('Cantón creado exitosamente', 'success');
        setTimeout(() => {
          this.router.navigate(['/gestionar cantones']);
        }, 1000);
      },
      error: async (error) => {
        console.error('Error al crear canton:', error);
        await loader.dismiss();
        this.presentToast('Error al guardar el cantón: ' + (error.message || error.statusText), 'danger');
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

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['Aceptar']
    });

    await alert.present();
  }
}
