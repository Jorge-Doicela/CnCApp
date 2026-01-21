import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
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

// Class-based guard for backwards compatibility with existing routes
export class AuthGuard {
  canActivate(route: any, state: any): boolean {
    return authGuard(route, state) as boolean;
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

