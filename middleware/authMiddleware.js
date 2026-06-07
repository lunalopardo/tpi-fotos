
// Protege rutas para que SOLO entren usuarios logueados
export const protegerRuta = (req, res, next) => {
    if (req.session && req.session.usuario) {
        return next();
    }
    return res.redirect('/auth/login');
};

// Evita que un usuario ya logueado vuelva a entrar a las pantallas de Login o Registro
export const redirigirSiLogueado = (req, res, next) => {
    if (req.session && req.session.usuario) {
        return res.redirect('/');
    }
    return next();
};