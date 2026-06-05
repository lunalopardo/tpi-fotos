import Publicacion from '../models/Publicacion.js';
import Usuario from '../models/usuario.js';
import { Sequelize } from 'sequelize';

Publicacion.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(Publicacion, { foreignKey: 'id_usuario' });

export const renderHome = async (req, res) => {
    try {
        const estaLogueado = req.session && req.session.usuario;
        const condicionesFiltro = { estado: 'activa' };

        if (!estaLogueado) {
            condicionesFiltro.copyright = 0; 
        }

        const publicacionesDB = await Publicacion.findAll({
            where: condicionesFiltro,
            include: [
                {
                    model: Usuario,
                    attributes: ['nombre_usuario']
                }
            ]
        });

        const publicacionesProcesadas = publicacionesDB.map(pub => {
            const fotoPlana = pub.get({ plain: true }); 
            
            if (!fotoPlana.rutas_archivos) {
                fotoPlana.imagenes = [];
            } else {
                fotoPlana.imagenes = fotoPlana.rutas_archivos.match(/data:image\/[^;]+;base64,[^,]+/g) || [];
            }
            
            return fotoPlana;
        });

        res.render('index', { 
            titulo: 'Fotaza 2 - Inicio', 
            publicaciones: publicacionesProcesadas 
        });

    } catch (error) {
        console.error('Error en renderHome:', error);
        res.status(500).send('Error al cargar el inicio');
    }
};