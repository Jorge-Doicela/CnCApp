import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController, AlertController } from '@ionic/angular';
import { RecuperacionDataUsuarioService } from './services/recuperacion-data-usuario.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { supabase } from 'src/supabase';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  userName: string | null = null;
  userRole: number | null = null;
  roleName: string | null = null;
  modulos: string[] = [];
  lastUrl: string = '';

  private destroy$ = new Subject<void>(); // Subject para limpiar suscripciones

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private alertController: AlertController,
    private recuperacionDataUsuarioService: RecuperacionDataUsuarioService
  ) {}

  ngOnInit() {
    this.recuperacionDataUsuarioService.checkUserSession();

    this.recuperacionDataUsuarioService.userName$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userName) => {
        this.userName = userName;
      });

    this.recuperacionDataUsuarioService.userRole$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userRole) => {
        this.userRole = userRole !== null ? Number(userRole) : null;
      });

    this.recuperacionDataUsuarioService.roleName$
      .pipe(takeUntil(this.destroy$))
      .subscribe((roleName) => {
        this.roleName = roleName;
      });

    this.recuperacionDataUsuarioService.modulos$
      .pipe(takeUntil(this.destroy$))
      .subscribe((modulos) => {
        this.modulos = modulos;
      });

    // Monitorear cambios de ruta para verificar el rol del usuario
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          if (this.lastUrl !== event.url) {
            this.lastUrl = event.url;
            this.verificarRolEnCambioRuta();
          }
        }
      });
  }

  async verificarRolEnCambioRuta() {
    const authUid = localStorage.getItem('auth_uid');
    if (!authUid) return; // No hay usuario autenticado

    // Verificar si el rol ha cambiado
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data: userData, error } = await supabase
        .from('Usuario')
        .select('Rol_Usuario')
        .eq('auth_uid', user.id)
        .single();

      if (error || !userData) return;

      const storedRoleStr = localStorage.getItem('user_role');
      if (!storedRoleStr) return;

      const storedRole = parseInt(storedRoleStr);

      if (userData.Rol_Usuario !== storedRole) {
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
    this.destroy$.next();
    this.destroy$.complete();
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
    await this.recuperacionDataUsuarioService.cerrarSesion();
    this.closeMenu();
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
