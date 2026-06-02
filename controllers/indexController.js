import Publicacion from '../models/Publicacion.js';
import Usuario from '../models/usuario.js';
// import Valoracion from '../models/valoracion.js';
import { Sequelize } from 'sequelize';

Publicacion.belongsTo(Usuario, { foreignKey: 'id_usuario' });
//Usuario.hasMany(Publicacion, { foreignKey: 'id_usuario' });

export const renderHome = async (req, res) => {
    try {
        const estaLogueado = req.session && req.session.usuario;
        const condicionesFiltro = { estado: 'activa' };

        if (!estaLogueado) {
            condicionesFiltro.copyright = '0';
        }

        const publicacionesDB = await Publicacion.findAll({
            where: condicionesFiltro,
            include: [
                {
                    model: Usuario,
                    // as: 'usuario' // Descomentá el alias solo si lo definiste así en tus asociaciones (Publicacion.belongsTo)
                    attributes: ['nombre_usuario']
                }
                /*,
                {
                    model: Valoracion,
                    attributes: []
                }
                */
            ],
            attributes: {
                include: [
                    // [Sequelize.fn('AVG', Sequelize.col('valoraciones.puntuacion')), 'promedio_rating'] 
                ]
            },
            // group: ['Publicacion.id_publicacion', 'Usuario.id_usuario'] 
        });

        res.render('index', { 
            titulo: 'Fotaza 2 - Inicio', 
            publicaciones: publicacionesDB 
        });

    } catch (error) {
        console.error('Error en renderHome:', error);
        res.status(500).send('Error al cargar el inicio');
    }
};