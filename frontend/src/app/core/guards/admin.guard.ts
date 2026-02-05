import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Admin Guard - Verifica que el usuario sea administrador
 * Permite acceso solo a usuarios con rol "Administrador"
 */
export const adminGuard: CanActivateFn = async (route, state) => {
    const router = inject(Router);
    const alertController = inject(AlertController);
    const authService = inject(AuthService);

    console.log('[ADMIN_GUARD] Iniciando verificación para:', state.url);

    // 1. Verificar autenticación
    const token = localStorage.getItem('accessToken');
    const userName = authService.userName;

    console.log('[ADMIN_GUARD] Auth check:', {
        hasToken: !!token,
        userName: userName()
    });

    if (!token || !userName()) {
        console.log('[ADMIN_GUARD] ❌ No autenticado - redirigiendo a login');
        await showAlert(
            alertController,
            'Sesión requerida',
            'Debe iniciar sesión para acceder a esta página'
        );
        router.navigate(['/login']);
        return false;
    }

    // 2. Verificar rol de administrador
    const roleName = authService.roleName;
    const userRole = authService.userRole;

    console.log('[ADMIN_GUARD] Role check:', {
        roleName: roleName(),
        roleId: userRole(),
        expectedRole: 'Administrador'
    });

    // Verificar por nombre de rol (más confiable)
    const isAdmin = roleName()?.toLowerCase() === 'administrador';

    if (!isAdmin) {
        console.log('[ADMIN_GUARD] ❌ Acceso denegado - rol insuficiente');
        await showAlert(
            alertController,
            'Acceso Denegado',
            `Esta sección es solo para administradores.\n\nTu rol actual: ${roleName() || 'Desconocido'}`
        );
        // No redirigir si ya estamos en home
        if (state.url !== '/home' && !state.url.startsWith('/home')) {
            router.navigate(['/home']);
        }
        return false;
    }

    console.log('[ADMIN_GUARD]  Acceso permitido');
    return true;
};

/**
 * Muestra una alerta al usuario
 */
async function showAlert(
    alertController: AlertController,
    header: string,
    message: string
): Promise<void> {
    const alert = await alertController.create({
        header,
        message,
        buttons: ['Aceptar'],
        cssClass: 'auth-alert',
        backdropDismiss: false
    });

    await alert.present();
}
