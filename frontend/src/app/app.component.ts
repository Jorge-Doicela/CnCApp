import { Component, OnInit, OnDestroy, effect, inject, ViewChild, ElementRef, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import {
  IonApp, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonIcon, IonLabel, IonItemDivider, IonRouterOutlet,
  MenuController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, timeOutline, bookOutline, locationOutline, briefcaseOutline,
  informationCircleOutline, logInOutline, logOutOutline, personAddOutline,
  personOutline, personCircleOutline, peopleOutline, calendarOutline,
  documentTextOutline, businessOutline, mapOutline, pinOutline,
  ribbonOutline, idCardOutline, listOutline, qrCodeOutline, appsOutline,
  searchOutline, checkmarkCircleOutline, closeCircleOutline, addCircleOutline,
  schoolOutline, trophyOutline, medalOutline, add, refreshOutline, arrowForwardOutline,
  checkmarkDoneOutline, lockClosedOutline, location, calendar, laptopOutline, time, people,
  createOutline, trashOutline, saveOutline, closeOutline, textOutline, alarmOutline,
  hourglassOutline, linkOutline, openOutline
} from 'ionicons/icons';

import { AuthService } from './features/auth/services/auth.service';
import { UsuarioService } from './features/user/services/usuario.service';
import { filter } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonApp, IonMenu, IonHeader, IonToolbar, IonContent,
    IonList, IonItem, IonIcon, IonLabel, IonRouterOutlet,
    HeaderComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  // Use AuthService signals
  private authService = inject(AuthService);

  userName = this.authService.userName;
  userRole = this.authService.roleName;
  modulos = this.authService.modulos;

  lastUrl: string = '';

  // Logic to show header
  showGlobalHeader = computed(() => {
    // Hide on auth pages
    const currentPath = this.lastUrl.split('?')[0]; // Simple access, better use router signal if available or effect
    const hiddenRoutes = ['/login', '/register', '/admin'];
    // This basic computed might not react to router changes if lastUrl isn't signal.
    // Better to use a signal updated by router events.
    return !hiddenRoutes.some(r => currentPath.startsWith(r));
  });

  private usuarioService = inject(UsuarioService);

  @ViewChild('menuFocusTarget', { read: ElementRef }) menuFocusTarget!: ElementRef;
  @ViewChild('mainContent', { read: ElementRef }) mainContent!: ElementRef;

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private alertController: AlertController
  ) {
    addIcons({
      'home-outline': homeOutline,
      'time-outline': timeOutline,
      'book-outline': bookOutline,
      'location-outline': locationOutline,
      'briefcase-outline': briefcaseOutline,
      'information-circle-outline': informationCircleOutline,
      'log-in-outline': logInOutline,
      'log-out-outline': logOutOutline,
      'person-add-outline': personAddOutline,
      'person-outline': personOutline,
      'person-circle-outline': personCircleOutline,
      'people-outline': peopleOutline,
      'calendar-outline': calendarOutline,
      'document-text-outline': documentTextOutline,
      'business-outline': businessOutline,
      'map-outline': mapOutline,
      'pin-outline': pinOutline,
      'ribbon-outline': ribbonOutline,
      'id-card-outline': idCardOutline,
      'list-outline': listOutline,
      'qr-code-outline': qrCodeOutline,
      'apps-outline': appsOutline,
      'search-outline': searchOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline,
      'add-circle-outline': addCircleOutline,
      'school-outline': schoolOutline,
      'trophy-outline': trophyOutline,
      'medal-outline': medalOutline,
      'add': add,
      'refresh-outline': refreshOutline,
      'arrow-forward-outline': arrowForwardOutline,
      'checkmark-done-outline': checkmarkDoneOutline,
      'lock-closed-outline': lockClosedOutline,
      'location': location,
      'calendar': calendar,
      'laptop-outline': laptopOutline,
      'time': time,
      'people': people,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'save-outline': saveOutline,
      'close-outline': closeOutline,
      'text-outline': textOutline,
      'alarm-outline': alarmOutline,
      'hourglass-outline': hourglassOutline,
      'link-outline': linkOutline,
      'open-outline': openOutline
    });

    // Effect to log user changes
    effect(() => {
      const user = this.userName();
      if (user) {
        console.log('Usuario autenticado:', user);
      }
    });
  }

  ngOnInit() {
    // Auth state is loaded by AuthService constructor automatically.

    // Monitorear cambios de ruta para verificar el rol del usuario
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (this.lastUrl !== event.url) {
          this.lastUrl = event.url;
          this.currentPath.set(event.urlAfterRedirects || event.url);
          this.verificarRolEnCambioRuta();
        }
      });
  }

  // Signal for reactive header visibility
  currentPath = signal('');

  showHeader = computed(() => {
    const path = this.currentPath().toLowerCase();

    // 1. Completely hide on Auth pages (Login/Register)
    if (path.includes('/login') || path.includes('/register')) return false;

    // 2. Define Public Routes where the Global Pill Header should appear
    //    - Root '/'
    //    - '/home' and its children (historia, direccion, etc.)
    //    - '/validar-certificados' (Public tool)
    const isPublicRoute =
      path === '/' ||
      path.startsWith('/home') ||
      path.startsWith('/validar-certificados');

    // 3. Show header ONLY on public routes.
    //    This ensures that when a logged-in user enters a module (e.g. /gestionar-usuarios),
    //    the global header disappears, preventing overlap and double-header issues.
    return isPublicRoute;
  });

  async verificarRolEnCambioRuta() {
    // Si no hay usuario en el estado reactivo, no verificamos roles (es guest)
    if (!this.userName()) return;

    const authUid = localStorage.getItem('auth_uid');
    if (!authUid) return;

    // Verificar si el rol ha cambiado
    try {
      // Assuming localStorage has auth_uid, we can check DB.
      // Ideally we shouldn't trust localStorage alone, but for this check it's okay.
      // Better to check current AuthService state if available.

      const userData = await firstValueFrom(this.usuarioService.getUsuarioByAuthId(authUid));

      if (!userData) return;

      const storedRoleName = localStorage.getItem('role_name');
      if (!storedRoleName) return;

      if (userData.rol?.nombre !== storedRoleName) {
        this.mostrarAlertaCambioRol();
      }
    } catch (err) {
      console.error('Error verificando rol en cambio de ruta:', err);
    }
  }

  async mostrarAlertaCambioRol() {
    const alert = await this.alertController.create({
      header: '¡Cambio de permisos detectado!',
      message: 'Sus permisos de usuario han sido modificados. Por motivos de seguridad, debe iniciar sesión nuevamente para aplicar los cambios.',
      buttons: [
        {
          text: 'Entendido',
          handler: () => {
            this.cerrarSesion();
          }
        }
      ],
      backdropDismiss: false
    });

    await alert.present();
  }

  ngOnDestroy() {
    // No need for destroy$ with signals, but keep for router subscription cleanup
  }

  handleMenuWillOpen() {
    // Quitar el foco del elemento activador (como el botón hamburguesa) ANTES de que
    // el contenido principal se oculte con aria-hidden.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  handleMenuOpen() {
    // requestAnimationFrame asegura que el foco se mueva en el siguiente frame de renderizado,
    // lo cual es más performante y seguro que setTimeout para evitar conflictos con aria-hidden.
    requestAnimationFrame(() => {
      if (this.menuFocusTarget?.nativeElement) {
        this.menuFocusTarget.nativeElement.focus();
      }
    });
  }

  handleMenuClose() {
    // Devolver el foco al contenido principal al cerrar para evitar "aria-hidden" bloqueado
    requestAnimationFrame(() => {
      if (this.mainContent?.nativeElement) {
        this.mainContent.nativeElement.focus();
      }
    });
  }

  openMenu() {
    this.menuCtrl.open();
  }

  closeMenu() {
    this.menuCtrl.close();
  }

  navegarModulo(modulo: string) {
    if (modulo === '/') {
      this.router.navigate(['/']);
      this.closeMenu();
      return;
    }

    // Mapeo de nombres de módulos a rutas específicas
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
      'Reportes': 'gestionar-reportes',
      'reportes': 'gestionar-reportes',
      'Ver Perfil': 'ver-perfil',
      'Ver conferencias': 'ver-conferencias',
      'Ver certificaciones': 'ver-certificaciones',
      'Ver certificados': 'ver-certificaciones',
      'Validar certificados': 'validar-certificados',
      'informacion': 'home/informacion',
      'direccion': 'home/direccion',
      'historia': 'home/historia',
      'norma-regul': 'home/norma-regul',
      'servi-progra': 'home/servi-progra',
      'Gestionar plantillas': 'gestionar-plantillas',
      'Plantillas': 'gestionar-plantillas'
    };

    // Obtener la ruta del mapeo o convertir el nombre del módulo a formato kebab-case
    let ruta = rutasModulos[modulo] || modulo.toLowerCase().replace(/\s+/g, '-');

    // Lógica específica para Creadores: Redirigir a rutas /creator/ para módulos compartidos
    const roleName = this.authService.roleName()?.toLowerCase();
    const isCreator = roleName?.includes('creador') || roleName?.includes('conferencia');

    if (isCreator) {
      // Lista de rutas que tienen versión específica para creadores
      const creatorRoutes = [
        'gestionar-capacitaciones',
        'gestionar-plantillas',
        'certificados' // Si aplica
      ];

      if (creatorRoutes.some(r => ruta.includes(r))) {
        ruta = `creator/${ruta}`;
      }
    }

    console.log(`Navegando a: /${ruta}`);
    this.router.navigate([`/${ruta}`]);
    this.closeMenu();
  }

  iraLogin() {
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  iraRegistro() {
    this.router.navigate(['/register']);
    this.closeMenu();
  }

  async cerrarSesion() {
    // Call logout on AuthService
    // We can just clear local data or call the API.
    // Ideally await firstValueFrom(this.authService.logout());
    // But for speed we can just clear.
    this.authService.clearAuthData();
    this.closeMenu();
    this.router.navigate(['/login']);
  }

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
      'Reportes': 'apps-outline',
      'reportes': 'apps-outline',
      'Ver Perfil': 'person-outline',
      'Ver conferencias': 'list-outline',
      'Ver certificaciones': 'document-text-outline',
      'Ver certificados': 'document-text-outline',
      'Validar certificados': 'qr-code-outline',
      'gestionar-plantillas': 'image-outline',
      'gestionar-roles': 'people-outline',
      'gestionar-usuarios': 'person-add-outline'
    };

    return iconMap[modulo] || 'apps-outline';
  }
}
