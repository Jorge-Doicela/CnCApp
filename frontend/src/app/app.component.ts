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
  homeOutline, logInOutline, personAddOutline, personCircleOutline, informationCircleOutline, locationOutline, bookOutline, documentTextOutline, calendarOutline, qrCodeOutline, logOutOutline, textOutline, alertCircleOutline, barcodeOutline, mapOutline, checkmarkCircleOutline, closeOutline, saveOutline, arrowBackOutline, searchOutline, search, addCircleOutline, closeCircleOutline, keyOutline, createOutline, trashOutline, swapVerticalOutline, personOutline, schoolOutline, checkmarkCircle, alertCircle, time, timeOutline, people, laptopOutline, gitMergeOutline, linkOutline, openOutline, peopleOutline, businessOutline, arrowForwardOutline, checkmarkOutline, addOutline, ribbonOutline, refreshOutline, ribbon, hourglassOutline, toggleOutline, wifiOutline, peopleCircleOutline, briefcaseOutline, lockClosedOutline, checkmarkDoneOutline, business, personCircle, mailOutline, analyticsOutline, downloadOutline, warningOutline, desktopOutline, shieldCheckmarkOutline, funnelOutline, trophyOutline, arrowBack, pinOutline, idCardOutline, imageOutline, cloudUploadOutline, layersOutline, eyeOutline, addCircle, filterOutline, create, playOutline, appsOutline, shieldCheckmark, apps, add, checkmarkDoneCircleOutline, callOutline, maleFemaleOutline, globeOutline, person, fingerPrintOutline, settingsOutline, flagOutline, arrowForwardCircle, easel, chevronForward, statsChart, arrowForward, colorPaletteOutline, rocketOutline, helpCircleOutline, sparklesOutline, busOutline, carOutline, navigateOutline, medalOutline, bodyOutline, swapHorizontalOutline, gitNetworkOutline, barChartOutline, scaleOutline, libraryOutline, walletOutline, carSportOutline, chevronForwardOutline, waterOutline, leafOutline, airplaneOutline, calculatorOutline, optionsOutline, fileTrayFullOutline, fitnessOutline, buildOutline, constructOutline, calendar, closeCircle, camera, gridOutline, statsChartOutline
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
    // Usa currentPath signal (reactivo), no lastUrl (no reactivo)
    const currentPath = this.currentPath().split('?')[0];
    const hiddenRoutes = ['/login', '/register', '/admin'];
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
      homeOutline, logInOutline, personAddOutline, personCircleOutline, informationCircleOutline, locationOutline, bookOutline, documentTextOutline, calendarOutline, qrCodeOutline, logOutOutline, textOutline, alertCircleOutline, barcodeOutline, mapOutline, checkmarkCircleOutline, closeOutline, saveOutline, arrowBackOutline, searchOutline, search, addCircleOutline, closeCircleOutline, keyOutline, createOutline, trashOutline, swapVerticalOutline, personOutline, schoolOutline, checkmarkCircle, alertCircle, time, timeOutline, people, laptopOutline, gitMergeOutline, linkOutline, openOutline, peopleOutline, businessOutline, arrowForwardOutline, checkmarkOutline, addOutline, ribbonOutline, refreshOutline, ribbon, hourglassOutline, toggleOutline, wifiOutline, peopleCircleOutline, briefcaseOutline, lockClosedOutline, checkmarkDoneOutline, business, personCircle, mailOutline, analyticsOutline, downloadOutline, warningOutline, desktopOutline, shieldCheckmarkOutline, funnelOutline, trophyOutline, arrowBack, pinOutline, idCardOutline, imageOutline, cloudUploadOutline, layersOutline, eyeOutline, addCircle, filterOutline, create, playOutline, appsOutline, shieldCheckmark, apps, add, checkmarkDoneCircleOutline, callOutline, maleFemaleOutline, globeOutline, person, fingerPrintOutline, settingsOutline, flagOutline, arrowForwardCircle, easel, chevronForward, statsChart, arrowForward, colorPaletteOutline, rocketOutline, helpCircleOutline, sparklesOutline, busOutline, carOutline, navigateOutline, medalOutline, bodyOutline, swapHorizontalOutline, gitNetworkOutline, barChartOutline, scaleOutline, libraryOutline, walletOutline, carSportOutline, chevronForwardOutline, waterOutline, leafOutline, airplaneOutline, calculatorOutline, optionsOutline, fileTrayFullOutline, fitnessOutline, buildOutline, constructOutline, calendar, closeCircle, camera, gridOutline, statsChartOutline
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
          // Removed checking roles on every single route change (Performance issue)
          // this.verificarRolEnCambioRuta();
        }
      });
  }

  // Signal for reactive header visibility
  currentPath = signal('');

  showHeader = computed(() => {
    const path = this.currentPath().toLowerCase();

    // Define the specific paths where we want the Global Header
    const publicPaths = [
      '/', '/home', '/validar-certificados'
    ];

    // Check if the current path matches exactly any of the public top-level paths
    // or starts with 'home/' (info pages)
    return publicPaths.includes(path) || path.startsWith('/home/');
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

    const roleName = this.authService.roleName()?.toLowerCase().trim() ?? '';
    const isConferencista = roleName === 'conferencista';
    const isAdmin = roleName === 'administrador';

    // Rutas del Admin (panel /gestionar-*)
    const adminRoutes: Record<string, string> = {
      'usuarios': 'gestionar-usuarios',
      'capacitaciones': 'gestionar-capacitaciones',
      'certificados': 'gestionar-certificados',
      'reportes': 'gestionar-reportes',
      'configuracion': 'gestionar-roles',
      'plantillas': 'gestionar-plantillas',
      'competencias': 'gestionar-competencias',
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
      'Gestionar plantillas': 'gestionar-plantillas',
      'Plantillas': 'gestionar-plantillas'
    };

    // Rutas del Conferencista (prefijo conferencista/)
    const conferencistaRoutes: Record<string, string> = {
      'capacitaciones': 'conferencista/gestionar-capacitaciones',
      'plantillas': 'conferencista/gestionar-plantillas',
      'inscripciones': 'ver-conferencias',
      'certificados': 'ver-certificaciones',
      'Gestionar capacitaciones': 'conferencista/gestionar-capacitaciones',
      'Gestionar capacitación': 'conferencista/gestionar-capacitaciones',
      'Plantillas': 'conferencista/gestionar-plantillas',
      'Gestionar plantillas': 'conferencista/gestionar-plantillas',
    };

    // Rutas comunes para todos los roles
    const commonRoutes: Record<string, string> = {
      'Ver Perfil': 'ver-perfil',
      'Ver conferencias': 'ver-conferencias',
      'Ver certificaciones': 'ver-certificaciones',
      'Ver certificados': 'ver-certificaciones',
      'Validar certificados': 'validar-certificados',
      'validar-certificados': 'validar-certificados',
      'informacion': 'home/informacion',
      'direccion': 'home/direccion',
      'historia': 'home/historia',
      'norma-regul': 'home/norma-regul',
      'servi-progra': 'home/servi-progra',
    };

    let ruta: string;

    if (commonRoutes[modulo]) {
      ruta = commonRoutes[modulo];
    } else if (isConferencista && conferencistaRoutes[modulo]) {
      ruta = conferencistaRoutes[modulo];
    } else if (isAdmin && adminRoutes[modulo]) {
      ruta = adminRoutes[modulo];
    } else {
      ruta = adminRoutes[modulo] || modulo.toLowerCase().replace(/\s+/g, '-');
    }

    console.log(`[NAV] Módulo: "${modulo}" → Rol: ${roleName} → Ruta: /${ruta}`);
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

