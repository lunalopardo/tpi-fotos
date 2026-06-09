
/**
 * Extrae de forma segura el ID del usuario en sesión
 * @param {Object} req - Objeto de petición de Express
 * @returns {number|null} ID del usuario o null si no está autenticado
 */
export function getAuthenticatedUserId(req) {
    const userId = Number(req.session?.usuario?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
        return null;
    }
    return userId;
}