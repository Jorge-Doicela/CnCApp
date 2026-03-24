import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import { SecureStorageService } from './secure-storage.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { WebAuthnUtil } from '../utils/webauthn.util';

@Injectable({
  providedIn: 'root'
})
export class BiometriaService {
  private authService = inject(AuthService);
  private secureStorage = inject(SecureStorageService);
  private fingerprintAIO = inject(FingerprintAIO);

  // States
  isAvailable = signal<boolean>(false);
  isActive = signal<boolean>(false);
  platformLabel = signal<string>('Biometría');
  platformIcon = signal<string>('finger-print-outline');

  constructor() {}

  async checkAvailability(): Promise<boolean> {
    const isNative = Capacitor.isNativePlatform();
    let available = false;

    if (isNative) {
      try {
        // FingerprintAIO.isAvailable returns a string of the type or throws if not available
        const result = await this.fingerprintAIO.isAvailable();
        // Potential values: "finger", "face", "biometric" on Android; "OK" sometimes on iOS or older versions
        available = !!result; 
        this.platformLabel.set('Biometría del Dispositivo');
      } catch (e) {
        console.error('[BIOMETRIA_SERVICE] FingerprintAIO not available:', e);
        available = false;
      }
    } else {
      available = await WebAuthnUtil.isAvailable();
      this.platformLabel.set(WebAuthnUtil.getPlatformLabel());
    }

    this.isAvailable.set(available);
    const label = this.platformLabel().toLowerCase();
    
    if (label.includes('windows')) this.platformIcon.set('shield-checkmark-outline');
    else if (label.includes('android') || label.includes('dispositivo')) this.platformIcon.set('finger-print-outline');
    else if (label.includes('face id')) this.platformIcon.set('person-outline');
    else this.platformIcon.set('finger-print-outline');

    return available;
  }

  async checkStatus(): Promise<boolean> {
    try {
      const value = await this.secureStorage.get('biometria_activada');
      const active = value === 'true';
      this.isActive.set(active);
      return active;
    } catch (e) {
      this.isActive.set(false);
      return false;
    }
  }

  async deactivate() {
    await this.secureStorage.set('biometria_activada', 'false');
    await this.secureStorage.remove('bio_token');
    await this.secureStorage.remove('bio_ci');
    await this.secureStorage.remove('bio_credential_id');
    this.isActive.set(false);
  }

  /**
   * Activates biometrics for the current user.
   * password: The current user's password for verification.
   */
  async activate(password: string): Promise<{ success: boolean; message?: string }> {
    const user = this.authService.currentUser();
    if (!user) return { success: false, message: 'Usuario no autenticado' };

    const ci = user.ci;
    const isNative = Capacitor.isNativePlatform();

    try {
      // 1. Verify password via Login
      const loginResponse = await firstValueFrom(this.authService.login(ci, password));
      if (!loginResponse.success) {
        return { success: false, message: 'Contraseña incorrecta' };
      }

      // 2. Register hardware
      if (isNative) {
        await this.fingerprintAIO.show({
          title: 'Confirmar Seguridad',
          subtitle: 'Active la biometría usando su dispositivo',
          description: 'Escanee su huella o rostro para completar el registro',
          disableBackup: true
        });
      } else {
        const credentialId = await WebAuthnUtil.registerBiometric(user.nombre);
        await this.secureStorage.set('bio_credential_id', credentialId);
      }

      // 3. Setup on Backend and get Biometric Token
      const setupResponse = await firstValueFrom(this.authService.setupBiometric());
      if (setupResponse.success && setupResponse.data.biometricToken) {
        await this.secureStorage.set('biometria_activada', 'true');
        await this.secureStorage.set('bio_ci', ci);
        await this.secureStorage.set('bio_token', setupResponse.data.biometricToken);
        
        this.isActive.set(true);
        return { success: true };
      } else {
        return { success: false, message: 'No se pudo generar el token biométrico en el servidor' };
      }
    } catch (e: any) {
      console.error('[BIOMETRIA_SERVICE] Error en activación:', e);
      return { success: false, message: e.message || 'Error de hardware o sensores' };
    }
  }
}
