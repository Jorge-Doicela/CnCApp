export const environment = {
  production: true,
  // IMPORTANTE: Actualizar estas URLs antes de desplegar a producción
  // Opción 1: Usar URL relativa (recomendado si backend y frontend están en el mismo dominio)
  apiUrl: '/api',
  // Opción 2: Usar URL absoluta (si backend está en un dominio diferente)
  // apiUrl: 'https://api.tu-dominio.com/api',
  redirectUrl: window.location.origin + '/recuperar-password',
};
