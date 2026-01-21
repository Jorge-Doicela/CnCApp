import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../pages/auth/services/auth.service';
import { catchError, map, of } from 'rxjs';

// Functional guard (modern approach)
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const alertController = inject(AlertController);
  const authService = inject(AuthService);

  // Check if user is authenticated via AuthService
  // Assuming AuthService has an isAuthenticated method or similar logic
  // Since the previous AuthService view showed standard Http methods, we'll adapt.

  // Checking local storage token as primary check for now, similar to how standard JWT auth works
  const token = localStorage.getItem('token');

  if (!token) {
    presentAuthAlert(alertController, 'Acceso denegado', 'Debe iniciar sesión para acceder a esta página');
    router.navigate(['/login']);
    return false;
  }

  // Verify role if needed
  if (state.url.includes('/admin/') || state.url.includes('gestionar-')) {
    const userRole = parseInt(localStorage.getItem('user_role') || '1');
    if (userRole !== 2) { // Assuming 2 is Admin
      presentAuthAlert(alertController, 'Acceso denegado', 'No tiene permisos de administrador para acceder a esta sección');
      router.navigate(['/']); // Go to home instead of non-existent path
      return false;
    }
  }

  return true;
};

// Injectable class-based guard for backwards compatibility with existing routes
export class AuthGuard {
  private router = inject(Router);
  private alertController = inject(AlertController);
  private authService = inject(AuthService);

  canActivate(route: any, state: any): boolean {
    // Check if user is authenticated
    const token = localStorage.getItem('token');

    if (!token) {
      this.presentAuthAlert('Acceso denegado', 'Debe iniciar sesión para acceder a esta página');
      this.router.navigate(['/login']);
      return false;
    }

    // Verify role if needed
    if (state.url.includes('/admin/') || state.url.includes('gestionar-')) {
      const userRole = parseInt(localStorage.getItem('user_role') || '1');
      if (userRole !== 2) { // Assuming 2 is Admin
        this.presentAuthAlert('Acceso denegado', 'No tiene permisos de administrador para acceder a esta sección');
        this.router.navigate(['/']); // Go to home instead of non-existent path
        return false;
      }
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

