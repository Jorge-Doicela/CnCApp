import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { CapacitacionesService } from 'src/app/pages/admin/crudcapacitaciones/services/capacitaciones.service';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { UsuarioService } from 'src/app/pages/user/services/usuario.service';

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
    Id_Capacitacion: null as number | null,
    Nombre_Capacitacion: '',
    Descripcion_Capacitacion: '',
    Fecha_Capacitacion: '',
    Lugar_Capacitacion: '',
    Estado: 0,
    Modalidades: '',
    Horas: 0,
    Limite_Participantes: 0,
    entidades_encargadas: [] as number[],
    ids_usuarios: [] as number[],
    Certificado: false
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
    const idCapacitacion = this.activatedRoute.snapshot.paramMap.get('Id_Capacitacion');
    if (idCapacitacion) {
      this.capacitacion.Id_Capacitacion = +idCapacitacion;
      this.cargarDatos();
    } else {
      this.mostrarToast('ID de capacitación no válido', 'danger');
      this.navController.navigateBack('/gestionar-capacitaciones');
    }
  }

  async cargarDatos() {
    const loading = await this.loadingController.create({
      message: 'Cargando datos...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await Promise.all([
        this.cargarCapacitacion(),
        this.cargarEntidades(),
        this.cargarUsuarios()
      ]);
      this.capacitacionOriginal = JSON.parse(JSON.stringify(this.capacitacion));
      this.cargando = false;
      loading.dismiss();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.mostrarToast('Error al cargar los datos', 'danger');
      this.cargando = false;
      loading.dismiss();
    }
  }

  cargarCapacitacion() {
    return new Promise<void>((resolve, reject) => {
      if (!this.capacitacion.Id_Capacitacion) {
        reject('No ID');
        return;
      }
      this.capacitacionesService.getCapacitacion(this.capacitacion.Id_Capacitacion).subscribe({
        next: (data) => {
          if (!data) {
            this.mostrarToast('No se encontró la capacitación', 'warning');
            this.navController.navigateBack('/gestionar-capacitaciones');
            reject();
            return;
          }
          this.capacitacion = { ...data };
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

    if (this.capacitacion.Certificado && this.hayBioCambiosCriticos()) {
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
      this.capacitacion.Nombre_Capacitacion !== this.capacitacionOriginal.Nombre_Capacitacion ||
      this.capacitacion.Fecha_Capacitacion !== this.capacitacionOriginal.Fecha_Capacitacion ||
      this.capacitacion.Lugar_Capacitacion !== this.capacitacionOriginal.Lugar_Capacitacion ||
      this.capacitacion.Horas !== this.capacitacionOriginal.Horas
    );
  }

  async guardarCambios() {
    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();

    if (!this.capacitacion.Id_Capacitacion) {
      loading.dismiss();
      return;
    }

    this.capacitacionesService.updateCapacitacion(this.capacitacion.Id_Capacitacion, this.capacitacion).subscribe({
      next: () => {
        this.capacitacionOriginal = JSON.parse(JSON.stringify(this.capacitacion));
        this.mostrarToast('Capacitación actualizada correctamente', 'success');

        if (this.capacitacion.Estado === 1 && !this.capacitacion.Certificado) {
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
            this.capacitacion.Estado = 1;
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

    if (!this.capacitacion.Id_Capacitacion) {
      loading.dismiss();
      return;
    }

    this.capacitacionesService.deleteCapacitacion(this.capacitacion.Id_Capacitacion).subscribe({
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
    this.navController.navigateForward(`/gestionar-capacitaciones/visualizarinscritos/${this.capacitacion.Id_Capacitacion}`);
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
