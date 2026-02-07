import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { CapacitacionesService } from 'src/app/features/admin/capacitaciones/services/capacitaciones.service';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EditarPage implements OnInit {
  @ViewChild('capacitacionForm') capacitacionForm!: NgForm;

  cargando: boolean = true;
  capacitacion = {
    id: null as number | null,
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    lugar: '',
    estado: 0,
    modalidad: '',
    horas: 0,
    limiteParticipantes: 0,
    entidadesEncargadas: [] as number[],
    idsUsuarios: [] as number[],
    certificado: false
  };

  capacitacionOriginal: any = {};
  entidadesList: any[] = [];
  usuariosList: any[] = [];

  private capacitacionesService = inject(CapacitacionesService);
  private catalogoService = inject(CatalogoService);
  private usuarioService = inject(UsuarioService);

  constructor(
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController,
    private navController: NavController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    const idCapacitacion = this.activatedRoute.snapshot.paramMap.get('id');
    if (idCapacitacion) {
      this.capacitacion.id = +idCapacitacion;
      // Non-blocking call
      this.cargarDatos();
    } else {
      this.mostrarToast('ID de capacitación no válido', 'danger');
      this.navController.navigateBack('/gestionar-capacitaciones');
    }
  }

  async cargarDatos() {
    const loading = await this.loadingController.create({
      message: 'Cargando datos de la capacitación...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Load in parallel
      const [capacitacionData] = await Promise.all([
        this.cargarCapacitacion(),
        this.cargarEntidades(),
        this.cargarUsuarios()
      ]);

      this.capacitacionOriginal = JSON.parse(JSON.stringify(this.capacitacion));
      this.cargando = false;
    } catch (error: any) {
      console.error('Error al cargar datos:', error);

      // Check if it's a 404 error
      if (error?.status === 404) {
        this.mostrarToast('No se encontró la capacitación solicitada', 'warning');
      } else {
        this.mostrarToast('Error al cargar los datos de la capacitación', 'danger');
      }

      this.cargando = false;

      // Navigate back after a short delay
      setTimeout(() => {
        this.navController.navigateBack('/gestionar-capacitaciones');
      }, 2000);
    } finally {
      await loading.dismiss();
    }
  }

  cargarCapacitacion() {
    return new Promise<void>((resolve, reject) => {
      if (!this.capacitacion.id) {
        reject('No ID');
        return;
      }
      this.capacitacionesService.getCapacitacion(this.capacitacion.id).subscribe({
        next: (data) => {
          if (!data) {
            this.mostrarToast('No se encontró la capacitación', 'warning');
            this.navController.navigateBack('/gestionar-capacitaciones');
            reject();
            return;
          }
          // Direct assignment - no mapping needed anymore
          this.capacitacion = { ...data } as any;
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  cargarEntidades() {
    return new Promise<void>((resolve, reject) => {
      this.catalogoService.getItems('entidades').subscribe({
        next: (data) => {
          this.entidadesList = data || [];
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  cargarUsuarios() {
    return new Promise<void>((resolve, reject) => {
      this.usuarioService.getUsuarios().subscribe({
        next: (data) => {
          this.usuariosList = data || [];
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  async actualizarCapacitacion() {
    if (!this.capacitacionForm.valid) {
      this.mostrarToast('Por favor complete todos los campos obligatorios', 'warning');
      return;
    }

    if (this.capacitacion.certificado && this.hayBioCambiosCriticos()) {
      const alert = await this.alertController.create({
        header: 'Advertencia',
        message: 'Esta capacitación tiene certificados emitidos. Cambiar información básica puede afectar la validez de los certificados. ¿Desea continuar?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Continuar',
            handler: () => {
              this.guardarCambios();
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.guardarCambios();
    }
  }

  hayBioCambiosCriticos(): boolean {
    return (
      this.capacitacion.nombre !== this.capacitacionOriginal.nombre ||
      this.capacitacion.fechaInicio !== this.capacitacionOriginal.fechaInicio ||
      this.capacitacion.lugar !== this.capacitacionOriginal.lugar ||
      this.capacitacion.horas !== this.capacitacionOriginal.horas
    );
  }

  async guardarCambios() {
    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();

    if (!this.capacitacion.id) {
      loading.dismiss();
      return;
    }

    // Direct use - no mapping needed anymore
    this.capacitacionesService.updateCapacitacion(this.capacitacion.id!, this.capacitacion as any).subscribe({
      next: () => {
        this.capacitacionOriginal = JSON.parse(JSON.stringify(this.capacitacion));
        this.mostrarToast('Capacitación actualizada correctamente', 'success');

        if (this.capacitacion.estado === 1 && !this.capacitacion.certificado) {
          loading.dismiss();
          this.preguntarEmitirCertificados();
        } else {
          setTimeout(() => {
            loading.dismiss();
            this.navController.navigateBack('/gestionar-capacitaciones');
          }, 1000);
        }
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error al actualizar:', error);
        this.mostrarToast('Error al actualizar la capacitación', 'danger');
      }
    });
  }

  async cancelarEdicion() {
    if (JSON.stringify(this.capacitacion) !== JSON.stringify(this.capacitacionOriginal)) {
      const alert = await this.alertController.create({
        header: 'Cambios no guardados',
        message: '¿Está seguro que desea cancelar? Los cambios realizados no se guardarán.',
        buttons: [
          {
            text: 'Continuar editando',
            role: 'cancel'
          },
          {
            text: 'Descartar cambios',
            handler: () => {
              this.navController.navigateBack('/gestionar-capacitaciones');
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.navController.navigateBack('/gestionar-capacitaciones');
    }
  }

  async finalizarCapacitacion() {
    const alert = await this.alertController.create({
      header: 'Finalizar capacitación',
      message: '¿Está seguro que desea marcar esta capacitación como realizada? Esto permitirá emitir certificados.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Finalizar',
          handler: async () => {
            this.capacitacion.estado = 1;
            await this.guardarCambios();
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmarEliminar() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Está seguro de eliminar esta capacitación? Esta acción no se puede deshacer y se perderán todos los datos asociados.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarCapacitacion();
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarCapacitacion() {
    const loading = await this.loadingController.create({
      message: 'Eliminando capacitación...',
      spinner: 'crescent'
    });
    await loading.present();

    if (!this.capacitacion.id) {
      loading.dismiss();
      return;
    }

    this.capacitacionesService.deleteCapacitacion(this.capacitacion.id).subscribe({
      next: () => {
        this.mostrarToast('Capacitación eliminada correctamente', 'success');
        setTimeout(() => {
          loading.dismiss();
          this.navController.navigateBack('/gestionar-capacitaciones');
        }, 1500);
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error al eliminar:', error);
        this.mostrarToast('Error al eliminar capacitación', 'danger');
      }
    });
  }

  async preguntarEmitirCertificados() {
    const alert = await this.alertController.create({
      header: 'Emitir Certificados',
      message: 'Ha marcado esta capacitación como "Realizada". ¿Desea emitir los certificados ahora?',
      buttons: [
        {
          text: 'Más tarde',
          handler: () => {
            this.navController.navigateBack('/gestionar-capacitaciones');
          }
        },
        {
          text: 'Emitir ahora',
          handler: () => {
            this.irAEmitirCertificados();
          }
        }
      ]
    });
    await alert.present();
  }

  irAEmitirCertificados() {
    this.navController.navigateForward(`/gestionar-capacitaciones/visualizarinscritos/${this.capacitacion.id}`);
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
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
