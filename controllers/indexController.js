import Publicacion from '../models/Publicacion.js';
import Usuario from '../models/usuario.js';
import Valoracion from '../models/valoracion.js'
import { Sequelize } from 'sequelize';

Publicacion.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(Publicacion, { foreignKey: 'id_usuario' });

export const renderHome = async (req, res, next) => {
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

        const promediosDB = await Valoracion.findAll({
            attributes: [
                'id_publicacion',
                [Sequelize.fn('AVG', Sequelize.col('puntuacion')), 'promedioTotal']
            ],
            group: ['id_publicacion']
        });

        const mapaPromedios = {};
        promediosDB.forEach(p => {
            mapaPromedios[p.id_publicacion] = p.get('promedioTotal');
        });

        const publicacionesProcesadas = publicacionesDB.map(pub => {
            const fotoPlana = pub.get({ plain: true }); 
            
            if (!fotoPlana.rutas_archivos) {
                fotoPlana.imagenes = [];
            } else {
                fotoPlana.imagenes = fotoPlana.rutas_archivos.match(/data:image\/[^;]+;base64,[^,]+/g) || [];
            }

            const idDeLaPub = fotoPlana.id_publicacion || fotoPlana.id;
            const promedioCrudo = mapaPromedios[idDeLaPub];
            
            fotoPlana.promedioFormateado = promedioCrudo ? Number(promedioCrudo).toFixed(1) : '0.0';
            
            return fotoPlana;
        });

        res.render('index', { 
            titulo: 'Fotaza 2 - Inicio', 
            publicaciones: publicacionesProcesadas 
        });

    } catch (error) {
        next(error);
    }
};