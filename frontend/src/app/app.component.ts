import { Component, OnInit, OnDestroy, effect, inject, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
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
  ribbonOutline, idCardOutline, listOutline, qrCodeOutline, appsOutline
} from 'ionicons/icons';

import { AuthService } from './features/auth/services/auth.service';
import { UsuarioService } from './features/user/services/usuario.service';
import { filter } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonApp, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonIcon, IonLabel, IonItemDivider, IonRouterOutlet
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
      'apps-outline': appsOutline
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
          this.verificarRolEnCambioRuta();
        }
      });
  }

  async verificarRolEnCambioRuta() {
    const authUid = localStorage.getItem('auth_uid');
    if (!authUid) return; // No hay usuario autenticado

    // Verificar si el rol ha cambiado
    try {
      // Assuming localStorage has auth_uid, we can check DB.
      // Ideally we shouldn't trust localStorage alone, but for this check it's okay.
      // Better to check current AuthService state if available.

      const userData = await firstValueFrom(this.usuarioService.getUsuarioByAuthId(authUid));

      if (!userData) return;

      const storedRoleStr = localStorage.getItem('user_role');
      if (!storedRoleStr) return;

      const storedRole = parseInt(storedRoleStr);

      if (userData.rolId !== storedRole) {
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
      'informacion': 'informacion',
      'direccion': 'direccion',
      'historia': 'historia',
      'norma-regul': 'norma-regul',
      'servi-progra': 'servi-progra'
    };

    // Obtener la ruta del mapeo o convertir el nombre del módulo a formato kebab-case
    const ruta = rutasModulos[modulo] || modulo.toLowerCase().replace(/\s+/g, '-');

    console.log(`Navegando a: /${ruta}`);
    this.router.navigate([`/${ruta}`]);
    this.closeMenu();
  }

  iraLogin() {
    this.router.navigate(['/login']);
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
      'Validar certificados': 'qr-code-outline'
    };

    return iconMap[modulo] || 'apps-outline';
  }
}
