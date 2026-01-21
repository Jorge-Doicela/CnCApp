import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ToastController, AlertController, NavController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CrearPage implements OnInit {
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
    nombre_rol: '',
    modulos: [] as string[],
  };

  estadoInicial: boolean = true;
  modulosSeleccionados: { [key: string]: boolean } = {};
  guardando: boolean = false;

  private catalogoService = inject(CatalogoService);

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {
    // Inicializar todos los módulos como no seleccionados
    this.modulos.forEach(modulo => {
      this.modulosSeleccionados[modulo] = false;
    });
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

  hayModulosSeleccionados(): boolean {
    return this.obtenerModulosSeleccionados().length > 0;
  }

  esFormularioValido(): boolean {
    return this.rol.nombre_rol.trim().length > 0 && this.hayModulosSeleccionados();
  }

  async crearRol() {
    if (!this.esFormularioValido()) {
      const mensaje = this.rol.nombre_rol.trim().length === 0
        ? 'Debe ingresar un nombre para el rol.'
        : 'Debe seleccionar al menos un módulo para el rol.';

      await this.presentToast(mensaje, 'warning');
      return;
    }

    // Evitar múltiples envíos
    if (this.guardando) return;
    this.guardando = true;

    try {
      const modulosSeleccionados = this.obtenerModulosSeleccionados();

      // Verificar existencia por nombre (obteniendo todos por ahora)
      // Idealmente el backend debería tener un endpoint de búsqueda o validación
      this.catalogoService.getItems('roles').subscribe({
        next: async (roles) => {
          const existe = roles.some((r: any) => r.nombre_rol.toLowerCase() === this.rol.nombre_rol.trim().toLowerCase());

          if (existe) {
            await this.presentToast('Ya existe un rol con este nombre. Por favor, utilice otro nombre.', 'warning');
            this.guardando = false;
            return;
          }

          // Crear el nuevo rol
          const nuevoRol = {
            nombre_rol: this.rol.nombre_rol.trim(),
            modulos: modulosSeleccionados,
            estado: this.estadoInicial
          };

          this.catalogoService.createItem('roles', nuevoRol).subscribe({
            next: async () => {
              await this.presentAlert(
                'Rol Creado',
                `El rol "${this.rol.nombre_rol}" ha sido creado exitosamente con ${modulosSeleccionados.length} módulos asignados.`,
                true
              );
              this.guardando = false;
            },
            error: async (error) => {
              console.error('Error al insertar el rol:', error);
              await this.presentToast('Error al crear el rol: ' + (error.message || error.statusText), 'danger');
              this.guardando = false;
            }
          });
        },
        error: async (error) => {
          console.error('Error al verificar roles:', error);
          await this.presentToast('Error al verificar existencia del rol', 'danger');
          this.guardando = false;
        }
      });

    } catch (error: any) {
      console.error('Error al crear el rol:', error);
      await this.presentToast('Error inesperado al crear el rol: ' + error.message, 'danger');
      this.guardando = false;
    }
  }

  async cancelar() {
    // Verificar si hay cambios antes de salir
    if (this.rol.nombre_rol.trim() || this.hayModulosSeleccionados()) {
      const alert = await this.alertController.create({
        header: 'Cancelar Creación',
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
