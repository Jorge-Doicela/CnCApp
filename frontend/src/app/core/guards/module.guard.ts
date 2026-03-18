import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Module Guard - Verifica en tiempo real si el usuario tiene el módulo asignado
 * para ingresar a esta ruta. Lee la propiedad data.requiredModule del router.
 */
export const moduleGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const alertController = inject(AlertController);
  const authService = inject(AuthService);

  const requiredModule = route.data?.['requiredModule'];
  
  // Si no requiere módulo, se asume que solo necesita autenticación (manejado por authGuard)
  if (!requiredModule) {
    return true;
  }

  const userModules = authService.modulos();
  
  if (userModules.includes(requiredModule)) {
    return true;
  }

  // Si no tiene el módulo, denegar acceso
  const alert = await alertController.create({
    header: 'Acceso Denegado',
    message: `No tienes el permiso necesario (${requiredModule}) para ingresar a esta sección.`,
    buttons: ['Aceptar'],
    cssClass: 'auth-alert',
    backdropDismiss: false
  });

  await alert.present();
  router.navigate(['/']);
  return false;
};
