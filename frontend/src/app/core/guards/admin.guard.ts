import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Admin Guard - Verifica que el usuario sea administrador (rol ID = 1)
 * Solo permite acceso a rutas administrativas si el usuario tiene rol de administrador
 */
export const adminGuard: CanActivateFn = async (route, state) => {
    const router = inject(Router);
    const alertController = inject(AlertController);
    const authService = inject(AuthService);

    // Verificar autenticación primero
    const token = localStorage.getItem('token');
    if (!token) {
        await presentAuthAlert(
            alertController,
            'Acceso denegado',
            'Debe iniciar sesión para acceder a esta página'
        );
        router.navigate(['/login']);
        return false;
    }

    // Verificar rol de administrador
    const userRole = authService.userRole();
    const storedRole = parseInt(localStorage.getItem('user_role') || '0');

    // Usar el rol del servicio si está disponible, sino usar localStorage
    const roleId = userRole !== null ? userRole : storedRole;

    if (roleId !== 1) {
        await presentAuthAlert(
            alertController,
            'Acceso denegado',
            'No tiene permisos de administrador para acceder a esta sección. Esta área es solo para administradores del sistema.'
        );
        router.navigate(['/home']);
        return false;
    }

    return true;
};

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
