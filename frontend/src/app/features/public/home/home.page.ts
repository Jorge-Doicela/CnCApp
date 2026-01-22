import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

import { CapacitacionesService } from '../../admin/capacitaciones/services/capacitaciones.service';
import { UsuarioService } from '../../user/services/usuario.service';
import { AuthService } from '../../auth/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class HomePage implements OnInit {
  // Use AuthService signals directly
  private authService = inject(AuthService);

  userName = this.authService.userName;
  userRole = this.authService.userRole;
  roleName = this.authService.roleName;
  modulos = this.authService.modulos;

  // Datos de conferencias
  Capacitaciones: any[] = [];
  capacitacionesDisponibles: any[] = [];
  ConferenciasInscritas: any[] = [];
  cargandoCapacitaciones: boolean = false;

  // Estadísticas
  proximasConferencias: number = 0;
  certificadosDisponibles: number = 0;
  usuariosCount: number = 0;
  conferenciasCount: number = 0;
  certificadosCount: number = 0;

  // Título de la página
  pageTitle: string = 'Inicio';

  private capacitacionesService = inject(CapacitacionesService);
  private usuarioService = inject(UsuarioService);

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router
  ) {
    // Use effect for reactive title updates (must be in injection context)
    effect(() => {
      this.actualizarTitulo();
      // Si el usuario cambia y existe, cargar datos
      if (this.userName()) {
        this.cargarDatos();
      }
    });
  }

  ngOnInit() {
    console.log('[HOME_DEBUG] Loaded Role Data:', {
      userName: this.userName(),
      roleName: this.roleName(),
      userRole: this.userRole(),
      modulos: this.modulos()
    });

    this.actualizarTitulo();
  }



  actualizarTitulo() {
    // Unwraps signals
    const user = this.userName();
    const role = this.roleName();

    if (user) {
      const isAdmin = role?.toLowerCase() === 'administrador';
      if (isAdmin) {
        this.pageTitle = 'Panel Administrativo';
      } else {
        this.pageTitle = 'Mi Portal';
      }
    } else {
      this.pageTitle = 'Bienvenido';
    }
  }

  async cargarDatos() {
    if (this.userName()) {
      // Usuario autenticado - cargar datos relevantes
      await this.RecuperarCapacitaciones();
      await this.RecuperarConferenciasInscrito();

      // Calcular estadísticas
      this.calcularEstadisticas();

      const role = this.roleName();
      if (role === 'Administrador' || role?.toLowerCase() === 'administrador') {
        await this.cargarEstadisticasAdmin();
      }
    }
  }

  async RecuperarCapacitaciones() {
    this.cargandoCapacitaciones = true;
    try {
      const data = await firstValueFrom(this.capacitacionesService.getCapacitaciones()) as any[];
      this.Capacitaciones = data ?? [];
      this.capacitacionesDisponibles = this.Capacitaciones.filter(c => c.Estado === 0);
    } catch (error) {
      console.error('Error al cargar capacitaciones:', error);
    } finally {
      this.cargandoCapacitaciones = false;
    }
  }

  async RecuperarConferenciasInscrito() {
    // Need ID Usuario
    const authUid = localStorage.getItem('auth_uid');
    if (!authUid) return;

    try {
      const idUsuario = await this.recuperarDataUsuario(authUid);
      if (!idUsuario) return;

      const inscripciones = await firstValueFrom(this.capacitacionesService.getInscripcionesUsuario(idUsuario)) as any[];

      if (inscripciones?.length) {
        // The service might just return junction table rows or full details.
        // If junction table rows, we need to fetch capacitaciones details.
        // Assuming service returns array with join or I need to fetch them.
        // Let's assume it returns { Id_Capacitacion, ... } and we need to fetch details if not joined.
        // Optimization: `getInscripcionesUsuario` could return partial capacitacion data.
        // If not, we fetch them.

        const capacitacionIds = inscripciones.map((item: any) => item.Id_Capacitacion);

        if (capacitacionIds.length > 0) {
          // Since we don't have "getByIds" in service, and `Capacitaciones` are already loaded in `RecuperarCapacitaciones` likely,
          // we can filter from `this.Capacitaciones` if loaded.
          // But strictly, we should ensure we have them.

          // If `this.Capacitaciones` is empty, load them first or use getCapacitacion in loop (bad)
          if (this.Capacitaciones.length === 0) {
            await this.RecuperarCapacitaciones();
          }

          this.ConferenciasInscritas = this.Capacitaciones.filter(c => capacitacionIds.includes(c.Id_Capacitacion));
        }
      } else {
        this.ConferenciasInscritas = [];
      }
    } catch (error) {
      console.error('Error al recuperar conferencias inscritas:', error);
    }
  }

  async recuperarDataUsuario(authUid: string) {
    try {
      const userData = await firstValueFrom(this.usuarioService.getUsuarioByAuthId(authUid)) as any;
      return userData?.Id_Usuario;
    } catch (error) {
      console.error('Error al recuperar datos usuario:', error);
      return null;
    }
  }

  calcularEstadisticas() {
    // Para usuarios normales
    this.proximasConferencias = this.ConferenciasInscritas.filter(c => c.Estado === 0).length;
    this.certificadosDisponibles = this.ConferenciasInscritas.filter(c => c.Estado === 1).length;
  }

  async cargarEstadisticasAdmin() {
    try {
      const userStats = await firstValueFrom(this.usuarioService.countUsuarios()) as any;
      this.usuariosCount = userStats?.count || 0;

      const confStats = await firstValueFrom(this.capacitacionesService.countCapacitaciones()) as any;
      this.conferenciasCount = confStats?.count || 0;

      const certStats = await firstValueFrom(this.capacitacionesService.countCertificados()) as any;
      this.certificadosCount = certStats?.count || 0;

    } catch (error) {
      console.error('Error al cargar estadísticas admin:', error);
    }
  }

  // Función para inscribirse en una conferencia
  async inscribirse(idCapacitacion: number) {
    const loading = await this.loadingController.create({
      message: 'Procesando inscripción...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const authUid = localStorage.getItem('auth_uid');
      if (!authUid) {
        this.showAuthWarning();
        return;
      }

      // Obtener el ID de usuario desde la base de datos usando el auth_uid
      const idUsuario = await this.recuperarDataUsuario(authUid);
      if (!idUsuario) {
        this.showErrorToast('Error al obtener el ID de usuario.');
        return;
      }

      await firstValueFrom(this.capacitacionesService.inscribirse(idUsuario, idCapacitacion) as any);


      this.showSuccessToast('¡Te has inscrito exitosamente en la conferencia!');

      // Actualizar los datos
      await this.RecuperarConferenciasInscrito();
      this.calcularEstadisticas();

    } catch (error) {
      console.error('Error en inscripción:', error);
      this.showErrorToast('Hubo un error al inscribirse en la conferencia.');
    } finally {
      loading.dismiss();
    }
  }

  // Función para cancelar la inscripción
  async cancelarInscripcion(idCapacitacion: number) {
    const loading = await this.loadingController.create({
      message: 'Procesando cancelación...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const authUid = localStorage.getItem('auth_uid');
      if (!authUid) {
        this.showAuthWarning();
        return;
      }

      const idUsuario = await this.recuperarDataUsuario(authUid);
      if (!idUsuario) {
        this.showErrorToast('Error al obtener el ID de usuario.');
        return;
      }

      await firstValueFrom(this.capacitacionesService.cancelarInscripcion(idUsuario, idCapacitacion) as any);

      this.showSuccessToast('Inscripción cancelada exitosamente.');

      // Actualizar datos
      await this.RecuperarConferenciasInscrito();
      this.calcularEstadisticas();

    } catch (error) {
      console.error('Error en cancelación:', error);
      this.showErrorToast('Error en el proceso de cancelación.');
    } finally {
      loading.dismiss();
    }
  }

  // Verificar si el usuario está inscrito en una capacitación
  isInscrito(idCapacitacion: number): boolean {
    return this.ConferenciasInscritas.some(c => c.Id_Capacitacion === idCapacitacion);
  }

  // Verificar si se puede mostrar el botón de inscripción
  puedeInscribirse(capacitacion: any): boolean {
    return capacitacion.Estado === 0 && !this.isInscrito(capacitacion.Id_Capacitacion);
  }

  // Verificar si se puede mostrar el botón de cancelar inscripción
  puedeCancelarInscripcion(capacitacion: any): boolean {
    return capacitacion.Estado === 0 && this.isInscrito(capacitacion.Id_Capacitacion);
  }

  // Navegar al login
  iraLogin() {
    this.router.navigate(['/login']);
  }

  // Navegar a un módulo
  navegarModulo(modulo: string) {
    // Mapeo específico para rutas de módulos
    const rutasModulos: { [key: string]: string } = {
      'Gestionar roles': 'gestionar-roles',
      'Gestionar capacitación': 'gestionar-capacitaciones',
      'Gestionar capacitaciones': 'gestionar-capacitaciones',
      'Gestionar usuarios': 'gestionar-usuarios',
      'Gestionar entidades': 'gestionar-entidades',
      'Gestionar provincias': 'gestionar-provincias',
      'Gestionar cantones': 'gestionar-cantones',
      'Gestionar parroquias': 'gestionar-parroquias',
      'Gestionar competencias': 'gestionar-competencias',
      'Gestionar instituciones': 'gestionar-instituciones',
      'Gestionar cargos instituciones': 'gestionar-cargos-instituciones',
      'Ver Perfil': 'ver-perfil',
      'Ver conferencias': 'ver-conferencias',
      'Ver certificaciones': 'ver-certificaciones',
      'Validar certificados': 'validar-certificados',
      'Servicios y programas': 'servi-progra',
      'servi-progra': 'servi-progra'
    };

    // Obtener la ruta correcta del mapeo o convertir a kebab-case
    const ruta = rutasModulos[modulo] || modulo.toLowerCase().replace(/\s+/g, '-');

    console.log(`Navegando a: /${ruta}`);
    this.router.navigate([`/${ruta}`]);
  }

  // Editar capacitación (para admin)
  editarCapacitacion(idCapacitacion: number) {
    this.router.navigate([`/gestionar-capacitaciones/editar/${idCapacitacion}`]);
  }

  // Obtener icono según el módulo
  getIconForModule(modulo: string): string {
    const iconMap: { [key: string]: string } = {
      'Gestionar roles': 'people-outline',
      'Gestionar capacitación': 'calendar-outline',
      'Gestionar capacitaciones': 'calendar-outline',
      'Gestionar usuarios': 'person-add-outline',
      'Gestionar entidades': 'business-outline',
      'Gestionar provincias': 'map-outline',
      'Gestionar cantones': 'location-outline',
      'Gestionar parroquias': 'pin-outline',
      'Gestionar competencias': 'ribbon-outline',
      'Gestionar instituciones': 'briefcase-outline',
      'Gestionar cargos instituciones': 'id-card-outline',
      'Ver Perfil': 'person-outline',
      'Ver conferencias': 'list-outline',
      'Ver certificaciones': 'document-text-outline',
      'Ver certificados': 'document-text-outline',
      'Validar certificados': 'qr-code-outline'
    };

    return iconMap[modulo] || 'apps-outline';
  }

  async showAuthWarning() {
    const toast = await this.toastController.create({
      message: 'Por favor, inicie sesión para realizar esta acción.',
      duration: 3000,
      position: 'top',
      color: 'warning'
    });
    toast.present();
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    toast.present();
  }

  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'success'
    });
    toast.present();
  }
}
