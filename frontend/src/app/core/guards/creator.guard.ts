import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Guard para el módulo Conferencista.
 * Permite acceso a usuarios con rol "Conferencista" o "Administrador".
 */
export const creatorGuard: CanActivateFn = async (_route, _state) => {
    const router = inject(Router);
    const alertController = inject(AlertController);
    const authService = inject(AuthService);

    // Verificar autenticación: preferir accessToken, luego token (legacy)
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
        await showAlert(alertController, 'Acceso denegado', 'Debe iniciar sesión para acceder a esta sección.');
        router.navigate(['/login']);
        return false;
    }

    const roleName = authService.roleName()?.toLowerCase().trim() ?? '';

    const ALLOWED_ROLES = ['conferencista', 'administrador'];
    const hasAccess = ALLOWED_ROLES.some(role => roleName === role);

    if (!hasAccess) {
        await showAlert(alertController, 'Sin permisos', 'Esta sección es exclusiva para Conferencistas y Administradores.');
        router.navigate(['/home']);
        return false;
    }

    return true;
};

async function showAlert(alertController: AlertController, header: string, message: string): Promise<void> {
    const alert = await alertController.create({
        header,
        message,
        buttons: ['Aceptar'],
        cssClass: 'auth-alert',
        backdropDismiss: false
    });
    await alert.present();
    await alert.onDidDismiss();
}
