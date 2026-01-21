// src/app/services/role-checker.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { interval, firstValueFrom } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleCheckerService {
  private checking = false;
  private checkInterval = 30000; // 30 segundos

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private router: Router
  ) { }

  startRoleChecking() {
    if (this.checking) return;

    this.checking = true;

    interval(this.checkInterval)
      .pipe(takeWhile(() => this.checking))
      .subscribe(() => {
        this.checkUserRole();
      });
  }

  stopRoleChecking() {
    this.checking = false;
  }

  async checkUserRole() {
    const userId = localStorage.getItem('auth_uid');
    if (!userId) {
      this.stopRoleChecking();
      return;
    }

    try {
      // Reemplazo de Supabase por llamada al Backend
      const userData = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/users/${userId}/role`)
      );

      const currentRole = parseInt(localStorage.getItem('user_role') || '1');

      // Si el rol cambió, mostrar alerta y forzar logout
      if (userData && userData.Rol_Usuario !== currentRole) {
        this.stopRoleChecking();
        await this.presentRoleChangeAlert();
        await this.logout();
      }
    } catch (error) {
      console.error('Error al verificar rol de usuario:', error);
    }
  }

  private async presentRoleChangeAlert() {
    const alert = await this.alertController.create({
      header: 'Cambio de permisos detectado',
      message: 'Sus permisos de acceso han sido modificados. Por seguridad, debe iniciar sesión nuevamente para aplicar los cambios.',
      buttons: ['Entendido'],
      cssClass: 'role-change-alert',
      backdropDismiss: false
    });

    await alert.present();
    return new Promise(resolve => {
      alert.onDidDismiss().then(() => {
        resolve(true);
      });
    });
  }

  async logout() {
    // await supabase.auth.signOut(); // Eliminado
    localStorage.removeItem('user_role');
    localStorage.removeItem('auth_uid');
    localStorage.removeItem('last_login_time');
    localStorage.removeItem('role_check_time');
    localStorage.removeItem('token'); // Asegurar borrado de token
    window.location.href = '/login'; // Forzar recarga completa
  }
}
