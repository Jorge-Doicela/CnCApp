import { Component, OnInit, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { IonicModule, MenuController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  home, time, book, location, briefcase, informationCircle,
  logIn, logOut, personAdd, person
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
  imports: [CommonModule, RouterModule, IonicModule]
})
export class AppComponent implements OnInit, OnDestroy {
  // Use AuthService signals
  private authService = inject(AuthService);

  userName = this.authService.userName;
  userRole = this.authService.roleName;
  modulos = this.authService.modulos;

  lastUrl: string = '';

  private usuarioService = inject(UsuarioService);

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private alertController: AlertController
  ) {
    addIcons({
      home, time, book, location, briefcase, informationCircle,
      logIn, logOut, personAdd, person
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
      'Ver Perfil': 'person-outline',
      'Ver conferencias': 'list-outline',
      'Ver certificaciones': 'document-text-outline',
      'Ver certificados': 'document-text-outline',
      'Validar certificados': 'qr-code-outline'
    };

    return iconMap[modulo] || 'apps-outline';
  }
}
