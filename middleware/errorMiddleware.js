export const manejadorErroresGlobal = (err, req, res, next) => {
    console.error('Error: ', err.stack || err.message || err);

    res.status(500).render('error', {
        titulo: 'Error en el servidor',
        mensaje: 'Ups! Algo salió mal de nuestro lado. Volvé a intentarlo más tarde.'
    });
};