import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Auth Guard - Verifica que el usuario esté autenticado
 * Solo verifica autenticación, NO verifica roles específicos
 * Para verificar roles de administrador, usar adminGuard
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const alertController = inject(AlertController);
  const authService = inject(AuthService);

  // Check if user is authenticated
  const token = localStorage.getItem('accessToken');

  if (!token) {
    await presentAuthAlert(
      alertController,
      'Acceso denegado',
      'Debe iniciar sesión para acceder a esta página'
    );
    router.navigate(['/login']);
    return false;
  }

  return true;
};

/**
 * Injectable class-based guard for backwards compatibility
 * Only checks authentication, not roles
 */
export class AuthGuard {
  private router = inject(Router);
  private alertController = inject(AlertController);
  private authService = inject(AuthService);

  async canActivate(route: any, state: any): Promise<boolean> {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');

    if (!token) {
      await this.presentAuthAlert(
        'Acceso denegado',
        'Debe iniciar sesión para acceder a esta página'
      );
      this.router.navigate(['/login']);
      return false;
    }

    return true;
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
}

async function presentAuthAlert(alertController: AlertController, header: string, message: string) {
  const alert = await alertController.create({
    header,
    message,
    buttons: ['Aceptar'],
    cssClass: 'auth-alert',
    backdropDismiss: false
  });

  await alert.present();
}


