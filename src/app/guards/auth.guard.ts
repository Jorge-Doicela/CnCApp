// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { supabase } from 'src/supabase';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private alertController: AlertController
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {
      // Verificar si hay sesión activa
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        this.presentAuthAlert('Acceso denegado', 'Debe iniciar sesión para acceder a esta página');
        this.router.navigate(['/login']);
        return false;
      }

      const userId = sessionData.session.user.id;
      const storedUserId = localStorage.getItem('auth_uid');

      // Verificar si el ID de usuario coincide con el almacenado
      if (userId !== storedUserId) {
        this.presentAuthAlert('Sesión inválida', 'Su sesión ha cambiado. Por favor, inicie sesión nuevamente');
        await this.logout();
        return false;
      }

      // Verificar el rol del usuario antes de permitir el acceso
      if (!await this.checkUserRole(userId)) {
        return false; // El método ya manejó la redirección si hubo un cambio de rol
      }

      // Verificar si la ruta requiere rol de admin
      if (state.url.includes('/admin/') || state.url.includes('gestionar-')) {
        const userRole = parseInt(localStorage.getItem('user_role') || '1');

        if (userRole !== 2) {
          this.presentAuthAlert('Acceso denegado', 'No tiene permisos de administrador para acceder a esta sección');
          this.router.navigate(['/user/cerificaciones']);
          return false;
        }
      }

      // Verificar si la ruta es específica para usuarios normales y el usuario es admin
      if (state.url.includes('/user/') || state.url.includes('ver-')) {
        const userRole = parseInt(localStorage.getItem('user_role') || '1');

        if (userRole === 2) {
          // El admin puede acceder a todo, pero podemos mostrar una notificación
          this.presentInfoAlert('Modo administrador', 'Está accediendo a una sección de usuario normal con privilegios de administrador');
        }
      }

      return true;
    } catch (error) {
      console.error('Error en AuthGuard:', error);
      this.presentAuthAlert('Error de autenticación', 'Ha ocurrido un error al verificar su sesión');
      await this.logout();
      return false;
    }
  }

  private async checkUserRole(userId: string): Promise<boolean> {
    try {
      const { data: userData, error } = await supabase
        .from('Usuario')
        .select('Rol_Usuario')
        .eq('auth_uid', userId)
        .single();

      if (error) {
        throw error;
      }

      const storedRole = parseInt(localStorage.getItem('user_role') || '1');

      // Si el rol cambió, forzar cierre de sesión inmediatamente
      if (userData && userData.Rol_Usuario !== storedRole) {
        this.presentRoleChangeAlert();
        await this.logout();
        return false;
      }

      // Actualizar tiempo de verificación
      localStorage.setItem('role_check_time', new Date().getTime().toString());
      return true;
    } catch (error) {
      console.error('Error al verificar rol de usuario:', error);
      return true; // Continuar con el rol actual en caso de error
    }
  }

  private async presentAuthAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Aceptar'],
      cssClass: 'auth-alert',
      backdropDismiss: false
    });

    await alert.present();
  }

  private async presentInfoAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Entendido'],
      cssClass: 'info-alert'
    });

    await alert.present();
  }

  private async presentRoleChangeAlert() {
    const alert = await this.alertController.create({
      header: 'Cambio de permisos detectado',
      message: 'Sus permisos de acceso han sido modificados por un administrador. Por seguridad, debe iniciar sesión nuevamente para aplicar los nuevos permisos.',
      buttons: ['Entendido'],
      cssClass: 'role-change-alert',
      backdropDismiss: false
    });

    await alert.present();
  }

  private async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('user_role');
    localStorage.removeItem('auth_uid');
    localStorage.removeItem('last_login_time');
    localStorage.removeItem('role_check_time');
    window.location.href = '/login';
  }
}
