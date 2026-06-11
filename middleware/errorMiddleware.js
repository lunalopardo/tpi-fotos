export const manejadorErroresGlobal = (err, req, res, next) => {
    const statusCode = err.status || 500;
    
    const mensajeError = err.message || 'Ups! Algo salió mal.';

    res.status(statusCode).render('error', {
        titulo: `Error ${statusCode}`,
        mensaje: mensajeError
    });
};