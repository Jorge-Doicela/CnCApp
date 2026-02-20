import { Component, OnInit, inject, effect, ChangeDetectionStrategy, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon,
  ToastController, LoadingController, MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logInOutline, personCircle, logOutOutline, searchOutline, mapOutline,
  peopleOutline, calendarOutline, documentTextOutline, personOutline,
  schoolOutline, briefcaseOutline, qrCodeOutline, arrowForward,
  createOutline, timeOutline, bookOutline, informationCircleOutline,
  locationOutline, personAddOutline, businessOutline, pinOutline,
  ribbonOutline, idCardOutline, listOutline, appsOutline, homeOutline,
  rocketOutline, timerOutline, notificationsOffOutline, menuOutline,
  statsChartOutline, settingsOutline, imageOutline,
  // Filled variants used in new design
  documentText, school, qrCode, logIn, calendarClearOutline,
  people, calendar, easel, image, ribbon, business, personAdd, person,
  checkmarkCircle, star, shieldCheckmark, time, keyOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';

import { CapacitacionesService } from '../../admin/capacitaciones/services/capacitaciones.service';
import { UsuarioService } from '../../user/services/usuario.service';
import { AuthService } from '../../auth/services/auth.service';
import { Capacitacion } from '../../../core/models/capacitacion.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit {
  // Use AuthService signals directly
  private authService = inject(AuthService);

  userName = this.authService.userName;
  userRole = this.authService.userRole;
  roleName = this.authService.roleName;
  modulos = this.authService.modulos;

  // Computed Role Helpers
  isGuest = computed(() => !this.userName());
  isAdmin = computed(() => {
    const r = this.roleName()?.toLowerCase();
    return r === 'administrador';
  });
  isCreator = computed(() => {
    const r = this.roleName()?.toLowerCase();
    return r?.includes('creador') || r?.includes('conferencista') || r?.includes('conferencia');
  });
  isUser = computed(() => {
    return !this.isAdmin() && !this.isCreator() && !this.isGuest();
  });


  // Datos de conferencias
  Capacitaciones: Capacitacion[] = [];
  capacitacionesDisponibles: Capacitacion[] = [];
  ConferenciasInscritas: Capacitacion[] = [];
  cargandoCapacitaciones: boolean = false;

  // Estadísticas
  proximasConferencias: number = 0;
  certificadosDisponibles: number = 0;
  usuariosCount: number = 0;
  conferenciasCount: number = 0;
  certificadosCount: number = 0;

  // Creator Stats
  myConferencesCount: number = 0;
  myAttendeesCount: number = 0;

  // Título de la página
  pageTitle: string = 'Inicio';

  private capacitacionesService = inject(CapacitacionesService);
  private usuarioService = inject(UsuarioService);
  private menuCtrl = inject(MenuController);
  private cd = inject(ChangeDetectorRef);

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router
  ) {
    // Register icons
    addIcons({
      'log-in-outline': logInOutline,
      'person-circle': personCircle,
      'log-out-outline': logOutOutline,
      'search-outline': searchOutline,
      'map-outline': mapOutline,
      'people-outline': peopleOutline,
      'calendar-outline': calendarOutline,
      'document-text-outline': documentTextOutline,
      'person-outline': personOutline,
      'school-outline': schoolOutline,
      'briefcase-outline': briefcaseOutline,
      'qr-code-outline': qrCodeOutline,
      'arrow-forward': arrowForward,
      'create-outline': createOutline,
      'time-outline': timeOutline,
      'book-outline': bookOutline,
      'information-circle-outline': informationCircleOutline,
      'location-outline': locationOutline,
      'person-add-outline': personAddOutline,
      'business-outline': businessOutline,
      'pin-outline': pinOutline,
      'ribbon-outline': ribbonOutline,
      'id-card-outline': idCardOutline,
      'list-outline': listOutline,
      'apps-outline': appsOutline,
      'home-outline': homeOutline,
      'rocket-outline': rocketOutline,
      'timer-outline': timerOutline,
      'notifications-off-outline': notificationsOffOutline,
      'stats-chart-outline': statsChartOutline,
      'menu-outline': menuOutline,
      'settings-outline': settingsOutline,
      'image-outline': imageOutline,
      // Filled icons
      'document-text': documentText,
      'school': school,
      'qr-code': qrCode,
      'log-in': logIn,
      'calendar-clear-outline': calendarClearOutline,
      'people': people,
      'calendar': calendar,
      'easel': easel,
      'image': image,
      'ribbon': ribbon,
      'business': business,
      'person-add': personAdd,
      'person': person,
      'search': searchOutline,
      'create': createOutline,
      // Landing Page Icons
      'checkmark-circle': checkmarkCircle,
      'star': star,
      'shield-checkmark': shieldCheckmark,
      'time': time,
      'key-outline': keyOutline
    });

    effect(() => {
      this.actualizarTitulo();
      // Load public data always
      this.RecuperarCapacitaciones();

      // Load user specifics if logged in
      if (this.userName()) {
        this.cargarDatosUsuario();
      }
    });
  }

  ngOnInit() {
    this.actualizarTitulo();
  }

  actualizarTitulo() {
    if (this.isAdmin()) this.pageTitle = 'Panel Administrativo';
    else if (this.isCreator()) this.pageTitle = 'Gestión de Eventos';
    else if (this.isUser()) this.pageTitle = 'Mi Portal';
    else this.pageTitle = 'Bienvenido';
  }

  toggleMenu() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.menuCtrl.toggle();
  }

  async cargarDatosUsuario() {
    await this.RecuperarConferenciasInscrito();
    this.calcularEstadisticas();

    if (this.isAdmin()) {
      await this.cargarEstadisticasAdmin();
    } else if (this.isCreator()) {
      // En un futuro, implementar endpoint real para creadores
      // Por ahora, reutilizamos stats parciales o mockeamos
      this.myConferencesCount = this.Capacitaciones.length; // Placeholder
      this.myAttendeesCount = 0; // Placeholder
    }
  }

  async RecuperarCapacitaciones() {
    this.cargandoCapacitaciones = true;
    try {
      const data = await firstValueFrom(this.capacitacionesService.getCapacitaciones());
      this.Capacitaciones = data ?? [];
      this.capacitacionesDisponibles = this.Capacitaciones.filter(c => c.estado === 'Activa');
    } catch (error) {
      console.error('Error al cargar capacitaciones:', error);
    } finally {
      this.cargandoCapacitaciones = false;
      this.cd.markForCheck();
    }
  }

  async RecuperarConferenciasInscrito() {
    const authUid = localStorage.getItem('auth_uid');
    if (!authUid) return;

    try {
      const idUsuario = await this.recuperarDataUsuario(authUid);
      if (!idUsuario) return;

      const inscripciones = await firstValueFrom(this.capacitacionesService.getInscripcionesUsuario(idUsuario)) as any[];

      if (inscripciones?.length) {
        const capacitacionIds = inscripciones.map((item: any) => item.capacitacionId || item.Id_Capacitacion);

        if (capacitacionIds.length > 0) {
          if (this.Capacitaciones.length === 0) {
            await this.RecuperarCapacitaciones();
          }
          this.ConferenciasInscritas = this.Capacitaciones.filter(c => capacitacionIds.includes(c.id));
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
      // Silent error for guests
      return null;
    }
  }

  calcularEstadisticas() {
    this.proximasConferencias = this.ConferenciasInscritas.filter(c => c.estado === 'Activa').length;
    this.certificadosDisponibles = this.ConferenciasInscritas.filter(c => c.estado === 'Finalizada').length;
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
    } finally {
      this.cd.markForCheck();
    }
  }

  async inscribirse(idCapacitacion: number) {
    if (this.isGuest()) {
      this.router.navigate(['/login']);
      return;
    }

    // ... same inscribirse logic needs to be robust ...
    // For brevity, ensuring the call works:
    const loading = await this.loadingController.create({ message: 'Inscribiendo...', spinner: 'crescent' });
    await loading.present();

    try {
      const authUid = localStorage.getItem('auth_uid');
      if (!authUid) throw new Error("No Auth ID");

      const idUsuario = await this.recuperarDataUsuario(authUid);
      if (!idUsuario) throw new Error("Usuario no encontrado");

      await firstValueFrom(this.capacitacionesService.inscribirse(idUsuario, idCapacitacion) as any);
      this.showSuccessToast('Inscripción exitosa');
      await this.RecuperarConferenciasInscrito();
      this.calcularEstadisticas();
    } catch (e) {
      this.showErrorToast('Error al inscribirse');
    } finally {
      loading.dismiss();
    }
  }

  // --- Navigation & Auth Wrappers ---

  iraLogin() {
    this.router.navigate(['/login']);
  }

  iraRegistro() {
    this.router.navigate(['/register']); // Assuming register route exists
  }

  cerrarSesion() {
    this.authService.clearAuthData();
    this.router.navigate(['/login']);
  }

  navegarModulo(modulo: string) {
    const rutasModulos: { [key: string]: string } = {
      'Gestionar roles': 'gestionar-roles',
      'Gestionar capacitación': 'gestionar-capacitaciones',
      'Gestionar capacitaciones': 'gestionar-capacitaciones',
      'Gestionar usuarios': 'gestionar-usuarios',
      'Gestionar entidades': 'gestionar-entidades',
      'Gestionar competencias': 'gestionar-competencias',
      'Gestionar instituciones': 'gestionar-instituciones',
      'Ver Perfil': 'ver-perfil',
      'Ver conferencias': 'ver-conferencias',
      'Ver certificaciones': 'ver-certificaciones',
      'Validar certificados': 'validar-certificados',
      'Ver capacitaciones': 'ver-conferencias',
      // Public Pages
      'historia': 'home/historia',
      'direccion': 'home/direccion',
      'norma-regul': 'home/norma-regul',
      'informacion': 'home/informacion',
      'servi-progra': 'home/servi-progra',
      // Bento/Admin shortcuts
      'Usuarios': 'gestionar-usuarios',
      'Conferencias': 'gestionar-capacitaciones',
      'Plantillas': 'gestionar-plantillas',
      'Reportes': 'gestionar-reportes',
      'Provincias': 'gestionar-provincias',
      'Cantones': 'gestionar-cantones',
      'Parroquias': 'gestionar-parroquias',
      'Entidades': 'gestionar-entidades',
      'Instituciones': 'gestionar-instituciones',
      'Cargos': 'gestionar-cargos-instituciones',
      'Competencias': 'gestionar-competencias'
    };

    let ruta = rutasModulos[modulo] || modulo.toLowerCase().replace(/\s+/g, '-');

    // Rol Creator Redirection
    if (this.isCreator()) {
      const creatorAllowed = ['gestionar-capacitaciones', 'gestionar-plantillas', 'validar-certificados'];
      if (creatorAllowed.some(ca => ruta.includes(ca))) {
        // Normalize for creator routes
        if (!ruta.startsWith('creator/')) {
          ruta = `creator/${ruta.replace('gestionar-', '')}`;
        }
      }
    }

    if (ruta === 'ver-conferencias' && this.isGuest()) {
      const el = document.getElementById('oferta-publica');
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
    }

    this.router.navigate([`/${ruta}`]);
  }

  // --- UI Helpers ---

  getIconForModule(modulo: string): string {
    return 'apps-outline'; // Simplified, usage in template can be hardcoded for bento
  }

  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2000, color: 'success', position: 'top' });
    toast.present();
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2000, color: 'danger', position: 'top' });
    toast.present();
  }
}
