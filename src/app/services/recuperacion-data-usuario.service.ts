import { Injectable, signal, computed, effect } from '@angular/core';
import { supabase } from 'src/supabase';
import { AlertController } from '@ionic/angular';

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

  constructor(private alertController: AlertController) {
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
      const { data: userData, error } = await supabase
        .from('Usuario')
        .select('Rol_Usuario')
        .eq('auth_uid', authUid)
        .single();

      if (error || !userData) return;

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
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.error('Error al obtener el usuario:', error?.message);
      return;
    }

    const { data: userData, error: fetchError } = await supabase
      .from('Usuario')
      .select('Nombre_Usuario, Id_Usuario, Rol_Usuario')
      .eq('auth_uid', user.id)
      .single();

    if (fetchError || !userData) {
      console.error('Error al obtener datos del usuario:', fetchError?.message);
      return;
    }

    const { data: roleData, error: fetchRoleError } = await supabase
      .from('Rol')
      .select('nombre_rol')
      .eq('Id_Rol', userData.Rol_Usuario)
      .single();

    if (fetchRoleError || !roleData) {
      console.error('Error al obtener el nombre de rol del usuario:', fetchRoleError?.message);
      return;
    }

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
    this.roleName.set(roleData.nombre_rol);

    // Actualizar localStorage
    localStorage.setItem('user_role', userData.Rol_Usuario.toString());
    localStorage.setItem('auth_uid', user.id);
    localStorage.setItem('role_check_time', new Date().getTime().toString());

    await this.obtenerModulos(userData.Rol_Usuario);
  }

  async obtenerModulos(userRoleID: number) {
    const { data, error } = await supabase
      .from('Rol')
      .select('modulos')
      .eq('Id_Rol', userRoleID)
      .single();

    if (error || !data) {
      console.error('Error al obtener los módulos:', error?.message);
      return;
    }

    try {
      // Intentar convertir a un arreglo si está en formato JSON
      const modulosArray = typeof data.modulos === 'string' ? JSON.parse(data.modulos) : data.modulos;

      if (Array.isArray(modulosArray)) {
        this.modulos.set(modulosArray);
      } else {
        console.error('Los módulos no están en formato de arreglo después del parseo');
      }
    } catch (e) {
      console.error('Error al convertir los módulos en un arreglo:', e);
    }
  }

  async cerrarSesion() {
    // Detener la verificación periódica
    this.stopRoleVerification();

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
      return;
    }

    // Limpiar localStorage
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
