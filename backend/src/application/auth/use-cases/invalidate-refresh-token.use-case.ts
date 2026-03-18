import { injectable } from 'tsyringe';

/**
 * InvalidateRefreshTokenUseCase
 *
 * Los refresh tokens son JWT stateless — no se persisten en base de datos.
 * La invalidación real ocurre en el cliente (eliminando el token de localStorage).
 * Este use case existe para cerrar el ciclo correctamente en el backend y permitir
 * que en el futuro se agregue una blocklist de tokens si se requiere.
 */
@injectable()
export class InvalidateRefreshTokenUseCase {
    async execute(_userId: number): Promise<void> {
        // Stateless JWT: no hay token almacenado en BD que invalidar.
        // Si en el futuro se agrega una blocklist (Redis/BD), implementar aquí.
        return;
    }
}
