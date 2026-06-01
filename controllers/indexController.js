import Publicacion from '../models/Publicacion.js';

export const renderHome = async (req, res) => {
    try {
        const publicacionesDB = await Publicacion.findAll({ where: { estado: 'activa' } });
        res.render('index', { titulo: 'Fotaza 2 - Inicio', publicaciones: publicacionesDB });
    } catch (error) {
        res.status(500).send('Error al cargar el inicio');
    }
};