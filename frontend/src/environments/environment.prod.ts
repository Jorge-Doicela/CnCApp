export const environment = {
  production: true,
  // URL de la API para el APK de prueba
  // NOTA PARA SERVIDOR REAL: Cambiar por la URL pública definitiva
  apiUrl: 'http://192.168.7.141:3000/api',
  // Esta URL se usará para redirecciones, por defecto apunta al mismo dominio del frontend
  redirectUrl: window.location.origin + '/recuperar-password',
};
