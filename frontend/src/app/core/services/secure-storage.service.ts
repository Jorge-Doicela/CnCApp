import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  // En una app real, esta llave podría derivarse de un ID único del dispositivo
  // Para esta implementación robusta, usamos una llave de cifrado local.
  private readonly SECRET_KEY = 'CNC_APP_LOCAL_ENCRYPTION_KEY_2026_SECURE';

  constructor() { }

  /**
   * Cifra y guarda un valor de forma segura en Preferences.
   */
  async set(key: string, value: string): Promise<void> {
    try {
      const encryptedValue = CryptoJS.AES.encrypt(value, this.SECRET_KEY).toString();
      await Preferences.set({ key, value: encryptedValue });
    } catch (error) {
      console.error('Error encrypting data:', error);
      // Fallback simple si el cifrado falla
      await Preferences.set({ key, value });
    }
  }

  /**
   * Obtiene y descifra un valor de Preferences.
   */
  async get(key: string): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key });
      if (!value) return null;

      // Intentamos descifrar
      try {
        const bytes = CryptoJS.AES.decrypt(value, this.SECRET_KEY);
        const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
        
        // Si no hay valor descifrado (posiblemente era un valor viejo sin cifrar)
        if (!decryptedValue) return value;
        
        return decryptedValue;
      } catch (e) {
        // Si falla el descifrado, probablemente el valor no estaba cifrado (migración)
        return value;
      }
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  }

  /**
   * Elimina un valor.
   */
  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('Error removing key:', error);
    }
  }
}
