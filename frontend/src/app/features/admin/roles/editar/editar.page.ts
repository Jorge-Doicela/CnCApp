import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EditarPage implements OnInit {
  idRol: number | null = null;
  modulos: string[] = [
    "Ver Perfil",
    "Ver conferencias",
    "Gestionar roles",
    "Gestionar capacitaciones",
    "Gestionar usuarios",
    "Gestionar entidades",
    "Gestionar provincias",
    "Gestionar parroquias",
    "Gestionar cantones",
    "Gestionar competencias",
    "Gestionar instituciones",
    "Validar certificados"
  ];

  rol = {
    nombre: '',
    modulos: [] as string[],
  };

  rolOriginal = {
    nombre: '',
    modulos: [] as string[],
    estado: false
  };

  rolActivo: boolean = false;
  modulosSeleccionados: { [key: string]: boolean } = {};
  cargando: boolean = true;
  errorCarga: boolean = false;
  actualizando: boolean = false;

  private catalogoService = inject(CatalogoService);

  constructor(
    private route: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController,
    private navController: NavController,
    private loadingController: LoadingController
  ) { }

  async ngOnInit() {
    this.idRol = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.idRol) {
      await this.presentToast('ID de rol no válido.', 'danger');
      this.errorCarga = true;
      this.cargando = false;
      return;
    }

    await this.cargarRol();
  }

  async cargarRol() {
    try {
      this.cargando = true;
      this.errorCarga = false;

      const loading = await this.loadingController.create({
        message: 'Cargando información del rol...',
        spinner: 'crescent'
      });
      await loading.present();

      if (!this.idRol) return;

      this.catalogoService.getItem('rol', this.idRol).subscribe({
        next: (data) => {
          if (!data) {
            this.presentToast('No se pudo cargar el rol.', 'danger');
            this.errorCarga = true;
            loading.dismiss();
            return;
          }

          // Guardar datos originales para comparar cambios
          this.rolOriginal = {
            nombre: data.nombre,
            modulos: data.modulos || [],
            estado: data.estado || false
          };

          // Asignar datos al modelo de edición
          this.rol = {
            nombre: data.nombre,
            modulos: data.modulos || []
          };
          this.rolActivo = data.estado || false;

          // Marcar los módulos seleccionados
          this.modulosSeleccionados = {};
          this.modulos.forEach(modulo => {
            this.modulosSeleccionados[modulo] = this.rol.modulos.includes(modulo);
          });

          loading.dismiss();
        },
        error: (error) => {
          console.error('Error al obtener el rol:', error);
          this.presentToast('Error al cargar los datos.', 'danger');
          this.errorCarga = true;
          loading.dismiss();
        }
      });

    } catch (error: any) {
      console.error('Error al iniciar carga del rol:', error);
      this.presentToast('Error inesperado.', 'danger');
      this.errorCarga = true;
    } finally {
      this.cargando = false;
    }
  }

  seleccionarTodos() {
    this.modulos.forEach(modulo => {
      this.modulosSeleccionados[modulo] = true;
    });
  }

  desseleccionarTodos() {
    this.modulos.forEach(modulo => {
      this.modulosSeleccionados[modulo] = false;
    });
  }

  obtenerModulosSeleccionados(): string[] {
    return this.modulos.filter(modulo => this.modulosSeleccionados[modulo]);
  }

  hayModificaciones(): boolean {
    const modulosSeleccionados = this.obtenerModulosSeleccionados();
    const modulosIguales = this.modulosSeleccionadosIguales(modulosSeleccionados, this.rolOriginal.modulos);

    return (
      this.rol.nombre !== this.rolOriginal.nombre ||
      this.rolActivo !== this.rolOriginal.estado ||
      !modulosIguales
    );
  }

  modulosSeleccionadosIguales(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    const set = new Set(arr2);
    return arr1.every(item => set.has(item));
  }

  esFormularioValido(): boolean {
    const modulosSeleccionados = this.obtenerModulosSeleccionados();
    return this.rol.nombre.trim().length > 0 &&
      modulosSeleccionados.length > 0 &&
      this.hayModificaciones();
  }

  async actualizarRol() {
    if (!this.esFormularioValido()) {
      if (!this.hayModificaciones()) {
        await this.presentToast('No se han realizado modificaciones.', 'warning');
        return;
      }

      const mensaje = this.rol.nombre.trim().length === 0
        ? 'Debe ingresar un nombre para el rol.'
        : 'Debe seleccionar al menos un módulo para el rol.';

      await this.presentToast(mensaje, 'warning');
      return;
    }

    // Mostrar confirmación
    const alert = await this.alertController.create({
      header: 'Confirmar Actualización',
      message: `¿Está seguro que desea actualizar el rol "${this.rol.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Actualizar',
          handler: () => {
            this.realizarActualizacion();
          }
        }
      ]
    });

    await alert.present();
  }

  async realizarActualizacion() {
    // Evitar múltiples envíos
    if (this.actualizando) return;
    this.actualizando = true;

    const loading = await this.loadingController.create({
      message: 'Actualizando rol...',
      spinner: 'crescent'
    });
    await loading.present();

    if (!this.idRol) {
      loading.dismiss();
      return;
    }

    const modulosSeleccionados = this.obtenerModulosSeleccionados();
    const dataToUpdate = {
      nombre: this.rol.nombre.trim(),
      modulos: modulosSeleccionados,
      estado: this.rolActivo
    };

    this.catalogoService.updateItem('rol', this.idRol, dataToUpdate).subscribe({
      next: async () => {
        await this.presentAlert(
          'Rol Actualizado',
          `El rol "${this.rol.nombre}" ha sido actualizado exitosamente.`,
          true
        );
        this.actualizando = false;
        loading.dismiss();
      },
      error: async (error) => {
        console.error('Error al actualizar el rol:', error);
        await this.presentToast('Error al actualizar el rol: ' + (error.message || error.statusText), 'danger');
        this.actualizando = false;
        loading.dismiss();
      }
    });
  }

  async cancelar() {
    // Verificar si hay cambios antes de salir
    if (this.hayModificaciones()) {
      const alert = await this.alertController.create({
        header: 'Cancelar Edición',
        message: '¿Está seguro que desea cancelar? Los cambios no guardados se perderán.',
        buttons: [
          {
            text: 'No, continuar editando',
            role: 'cancel'
          },
          {
            text: 'Sí, cancelar',
            handler: () => {
              this.navController.navigateBack('/gestionar-roles');
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.navController.navigateBack('/gestionar-roles');
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
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

  async presentAlert(header: string, message: string, navigateBack: boolean = false) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            if (navigateBack) {
              this.navController.navigateBack('/gestionar-roles');
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
