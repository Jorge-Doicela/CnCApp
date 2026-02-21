import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ToastController, AlertController, NavController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    nombre: '',
    modulos: [] as string[],
  };

  estadoInicial: boolean = true;
  modulosSeleccionados: { [key: string]: boolean } = {};
  guardando: boolean = false;

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

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
    return this.rol.nombre.trim().length > 0 && this.hayModulosSeleccionados();
  }

  async crearRol() {
    if (!this.esFormularioValido()) {
      const mensaje = this.rol.nombre.trim().length === 0
        ? 'Debe ingresar un nombre para el rol.'
        : 'Debe seleccionar al menos un módulo para el rol.';

      await this.presentToast(mensaje, 'warning');
      return;
    }

    // Evitar múltiples envíos
    if (this.guardando) return;
    this.guardando = true;
    this.cd.markForCheck();

    try {
      const modulosSeleccionados = this.obtenerModulosSeleccionados();

      // Verificar existencia por nombre (obteniendo todos por ahora)
      const roles = await firstValueFrom(this.catalogoService.getItems('rol'));
      const existe = (roles ?? []).some((r: any) => r.nombre.toLowerCase() === this.rol.nombre.trim().toLowerCase());

      if (existe) {
        await this.presentToast('Ya existe un rol con este nombre. Por favor, utilice otro nombre.', 'warning');
        this.guardando = false;
        this.cd.markForCheck();
        return;
      }

      // Crear el nuevo rol
      const nuevoRol = {
        nombre: this.rol.nombre.trim(),
        modulos: modulosSeleccionados,
        estado: this.estadoInicial
      };

      await firstValueFrom(this.catalogoService.createItem('rol', nuevoRol));

      await this.presentAlert(
        'Rol Creado',
        `El rol "${this.rol.nombre}" ha sido creado exitosamente con ${modulosSeleccionados.length} módulos asignados.`,
        true
      );
      this.guardando = false;
      this.cd.markForCheck();

    } catch (error: any) {
      console.error('Error al crear el rol:', error);
      await this.presentToast('Error al crear el rol: ' + (error.message || error.statusText), 'danger');
      this.guardando = false;
      this.cd.markForCheck();
    }
  }

  async cancelar() {
    // Verificar si hay cambios antes de salir
    if (this.rol.nombre.trim() || this.hayModulosSeleccionados()) {
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
