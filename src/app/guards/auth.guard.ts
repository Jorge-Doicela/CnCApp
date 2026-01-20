import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { supabase } from 'src/supabase';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const alertController = inject(AlertController);

  try {
    // Verificar si hay sesión activa
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      await presentAuthAlert(alertController, 'Acceso denegado', 'Debe iniciar sesión para acceder a esta página');
      router.navigate(['/login']);
      return false;
    }

    const userId = sessionData.session.user.id;
    const storedUserId = localStorage.getItem('auth_uid');

    // Verificar si el ID de usuario coincide con el almacenado
    if (userId !== storedUserId) {
      await presentAuthAlert(alertController, 'Sesión inválida', 'Su sesión ha cambiado. Por favor, inicie sesión nuevamente');
      await logout();
      return false;
    }

    // Verificar el rol del usuario antes de permitir el acceso
    if (!await checkUserRole(userId, alertController)) {
      return false; // El método ya manejó la redirección si hubo un cambio de rol
    }

    // Verificar si la ruta requiere rol de admin
    if (state.url.includes('/admin/') || state.url.includes('gestionar-')) {
      const userRole = parseInt(localStorage.getItem('user_role') || '1');

      if (userRole !== 2) {
        await presentAuthAlert(alertController, 'Acceso denegado', 'No tiene permisos de administrador para acceder a esta sección');
        router.navigate(['/user/cerificaciones']);
        return false;
      }
    }

    // Verificar si la ruta es específica para usuarios normales y el usuario es admin
    if (state.url.includes('/user/') || state.url.includes('ver-')) {
      const userRole = parseInt(localStorage.getItem('user_role') || '1');

      if (userRole === 2) {
        // El admin puede acceder a todo, pero podemos mostrar una notificación
        await presentInfoAlert(alertController, 'Modo administrador', 'Está accediendo a una sección de usuario normal con privilegios de administrador');
      }
    }

    return true;
  } catch (error) {
    console.error('Error en AuthGuard:', error);
    await presentAuthAlert(alertController, 'Error de autenticación', 'Ha ocurrido un error al verificar su sesión');
    await logout();
    return false;
  }
};

async function checkUserRole(userId: string, alertController: AlertController): Promise<boolean> {
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
      await presentRoleChangeAlert(alertController);
      await logout();
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

async function presentInfoAlert(alertController: AlertController, header: string, message: string) {
  const alert = await alertController.create({
    header,
    message,
    buttons: ['Entendido'],
    cssClass: 'info-alert'
  });

  await alert.present();
}

async function presentRoleChangeAlert(alertController: AlertController) {
  const alert = await alertController.create({
    header: 'Cambio de permisos detectado',
    message: 'Sus permisos de acceso han sido modificados por un administrador. Por seguridad, debe iniciar sesión nuevamente para aplicar los nuevos permisos.',
    buttons: ['Entendido'],
    cssClass: 'role-change-alert',
    backdropDismiss: false
  });

  await alert.present();
}

async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem('user_role');
  localStorage.removeItem('auth_uid');
  localStorage.removeItem('last_login_time');
  localStorage.removeItem('role_check_time');
  localStorage.removeItem('token');
  window.location.href = '/login';
}

// Export class-based guard for backwards compatibility
export { AuthGuard } from './auth.guard.class';
