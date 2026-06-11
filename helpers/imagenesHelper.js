
// Genera rutas URL amigables para las imágenes de la publicación, evitando enviar datos pesados Base64 directamente al HTML como tenía antes.
export function obtenerArrayImagenes(rutasArchivos, idPublicacion) {
    if (!rutasArchivos || !idPublicacion) return [];

    const cantidadImagenes = rutasArchivos.split('|').length;
    const arrayUrls = [];

    for (let i = 0; i < cantidadImagenes; i++) {
        arrayUrls.push(`/publicacion/foto/${idPublicacion}/${i}`);
    }

    return arrayUrls;
}