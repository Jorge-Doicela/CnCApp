export class WebAuthnUtil {
  
  /**
   * Generates a random challenge for WebAuthn.
   */
  private static generateRandomBuffer(length: number): ArrayBuffer {
    const buffer = new Uint8Array(length);
    crypto.getRandomValues(buffer);
    return buffer.buffer as ArrayBuffer;
  }

  /**
   * Converts an ArrayBuffer to a Base64 string safely.
   */
  private static bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Converts a Base64 string back to an ArrayBuffer.
   */
  private static base64ToBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Checks if WebAuthn is available and supports platform authenticators (Windows Hello, Touch ID).
   */
  static async isAvailable(): Promise<boolean> {
    if (!window.PublicKeyCredential) {
      return false;
    }
    // Check if a platform authenticator (TouchID/Windows Hello) is available
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }

  /**
   * Prompts the user to register their platform biometric.
   * Conceptually signs them up for WebAuthn.
   * Returns a credential ID string (base64) that should be saved in Preferences.
   */
  static async registerBiometric(username: string = 'Usuario CNC'): Promise<string> {
    const challenge = this.generateRandomBuffer(32);
    const userId = this.generateRandomBuffer(16);

    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge: challenge as BufferSource,
      rp: {
        name: 'CNC App Local Security',
        id: window.location.hostname || 'localhost'
      },
      user: {
        id: userId as BufferSource,
        name: 'user@cnc.local',
        displayName: username
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },  // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Enforce Touch ID / Windows Hello
        userVerification: 'required',
        residentKey: 'discouraged'
      },
      timeout: 60000,
      attestation: 'none'
    };

    try {
      const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
      if (credential) {
        return this.bufferToBase64(credential.rawId);
      }
      throw new Error('No se pudo crear la credencial.');
    } catch (error) {
       console.error('[WebAuthn] Register error:', error);
       throw error;
    }
  }

  /**
   * Prompts the user to authenticate using the previously generated credential ID.
   * Returns true if authentication succeeded.
   */
  static async verifyBiometric(credentialIdBase64: string): Promise<boolean> {
    const challenge = this.generateRandomBuffer(32);
    const rawIdBuffer = this.base64ToBuffer(credentialIdBase64);

    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge: challenge as BufferSource,
      allowCredentials: [
        {
          type: 'public-key',
          id: rawIdBuffer as BufferSource,
        }
      ],
      userVerification: 'required',
      timeout: 60000,
      rpId: window.location.hostname || 'localhost'
    };

    try {
      const assertion = await navigator.credentials.get({ publicKey }) as PublicKeyCredential;
      if (assertion) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('[WebAuthn] Verify error:', error);
      throw error;
    }
  }
}
