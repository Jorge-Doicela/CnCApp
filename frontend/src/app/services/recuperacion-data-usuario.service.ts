import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecuperacionDataUsuarioService {
  // Signals replacing BehaviorSubjects
  userName = signal<string | null>(null);
  userRole = signal<string | null>(null);
  modulos = signal<string[]>([]);
  userId = signal<number | null>(null);
  roleName = signal<string | null>(null);

  // Computed values (derived state)
  isAuthenticated = computed(() => this.userName() !== null);
  userRoleNumber = computed(() => {
    const role = this.userRole();
    return role !== null ? Number(role) : null;
  });

  // Intervalo para verificar cambios de rol
  private roleCheckInterval: any = null;

  constructor(
    private http: HttpClient,
    private alertController: AlertController
  ) {
    // Iniciar verificación periódica de rol
    this.startRoleVerification();
  }

  startRoleVerification() {
    // Verificar el rol cada 30 segundos (ajustable según necesidades)
    this.roleCheckInterval = setInterval(() => {
      this.verificarCambioRol();
    }, 30000);
  }

  stopRoleVerification() {
    if (this.roleCheckInterval) {
      clearInterval(this.roleCheckInterval);
      this.roleCheckInterval = null;
    }
  }

  async verificarCambioRol() {
    const authUid = localStorage.getItem('auth_uid');
    const storedRoleStr = localStorage.getItem('user_role');

    if (!authUid || !storedRoleStr) return;

    const storedRole = parseInt(storedRoleStr);

    try {
      const userData = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/users/${authUid}/role`)
      );

      if (!userData) return;

      if (userData.Rol_Usuario !== storedRole) {
        // Rol ha cambiado, mostrar alerta y forzar cierre de sesión
        this.showRoleChangeAlert();
      }
    } catch (err) {
      console.error('Error verificando cambio de rol:', err);
    }
  }

  async showRoleChangeAlert() {
    const alert = await this.alertController.create({
      header: '¡Cambio de permisos detectado!',
      message: 'Sus permisos han sido modificados por un administrador. Por seguridad, debe iniciar sesión nuevamente para aplicar los nuevos permisos.',
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

  // Verifica si el usuario está autenticado
  async checkUserSession() {
    const token = localStorage.getItem('token');
    const authUid = localStorage.getItem('auth_uid');

    if (!token || !authUid) {
      // console.error('No hay sesión activa');
      return;
    }

    try {
      // 1. Obtener datos del usuario desde el Backend
      const userData = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/users/profile/${authUid}`)
      );

      if (!userData) {
        console.error('No se encontraron datos del usuario');
        return;
      }

      // 2. Obtener datos del Rol
      // Asumimos que el backend podría incluir esto, pero si no, hacemos otra llamada o usamos lo que venga
      // Si userData incluye el nombre del rol, mejor. Si no, llamada separada.
      // Simulamos llamada separada para mantener estructura anterior por ahora:
      const roleData = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/roles/${userData.Rol_Usuario}`)
      );

      // Comprobar si el rol almacenado es diferente al actual
      const storedRoleStr = localStorage.getItem('user_role');
      if (storedRoleStr) {
        const storedRole = parseInt(storedRoleStr);
        if (storedRole !== userData.Rol_Usuario) {
          this.showRoleChangeAlert();
          return;
        }
      }

      // Actualiza el estado del usuario usando signals
      this.userName.set(userData.Nombre_Usuario);
      this.userId.set(userData.Id_Usuario);
      this.userRole.set(userData.Rol_Usuario.toString());
      this.roleName.set(roleData ? roleData.nombre_rol : 'Rol Desconocido');

      // Actualizar localStorage
      localStorage.setItem('user_role', userData.Rol_Usuario.toString());
      localStorage.setItem('auth_uid', authUid); // Debería ya estar
      localStorage.setItem('role_check_time', new Date().getTime().toString());

      await this.obtenerModulos(userData.Rol_Usuario);

    } catch (error) {
      console.error('Error al verificar sesión con backend:', error);
    }
  }

  async obtenerModulos(userRoleID: number) {
    try {
      const data = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/roles/${userRoleID}/modules`)
      );

      if (!data) {
        return;
      }

      // Intentar convertir a un arreglo si está en formato JSON
      const modulosArray = typeof data.modulos === 'string' ? JSON.parse(data.modulos) : data.modulos;

      if (Array.isArray(modulosArray)) {
        this.modulos.set(modulosArray);
      } else {
        console.error('Los módulos no están en formato de arreglo después del parseo');
      }
    } catch (e) {
      console.error('Error al obtener módulos:', e);
    }
  }

  async cerrarSesion() {
    // Detener la verificación periódica
    this.stopRoleVerification();

    // Eliminar token y datos locales
    localStorage.removeItem('user_role');
    localStorage.removeItem('auth_uid');
    localStorage.removeItem('last_login_time');
    localStorage.removeItem('role_check_time');
    localStorage.removeItem('token');

    // Limpiar signals
    this.userName.set(null);
    this.userId.set(null);
    this.userRole.set(null);
    this.roleName.set(null);
    this.modulos.set([]);

    console.log('Sesión cerrada con éxito.');
    window.location.href = '/login'; // Forzar recarga completa para ir a login
  }
}
