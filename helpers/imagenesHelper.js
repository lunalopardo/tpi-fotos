// Extrae los strings Base64 de las imágenes empaquetadas en rutas_archivos
export function parsearImagenesBase64(rutasArchivos) {
    if (!rutasArchivos) return [];
    return rutasArchivos.match(/data:image\/[^;]+;base64,[^,]+/g) || [];
}