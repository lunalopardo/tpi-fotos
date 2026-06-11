import Publicacion from '../models/publicacion.js';
import Usuario from '../models/usuario.js';
import Valoracion from '../models/valoracion.js'
import { Sequelize } from 'sequelize';
import { obtenerArrayImagenes } from '../helpers/imagenesHelper.js';

export const renderHome = async (req, res, next) => {
    try {
        const estaLogueado = req.session && req.session.usuario;
        const condicionesFiltro = { estado: 'activa' };
        const orden = req.query.orden || 'reciente';

        if (!estaLogueado) {
            condicionesFiltro.copyright = 0;
        }

        let ordenSequelize = [['fecha_subida', 'DESC']];
        if (orden === 'antiguo') {
            ordenSequelize = [['fecha_subida', 'ASC']];
        }

        const publicacionesDB = await Publicacion.findAll({
            where: condicionesFiltro,
            order: ordenSequelize,
            include: [
                {
                    model: Usuario,
                    // traemos el id_usuario para poder armar el link del perfil
                    attributes: ['id_usuario', 'nombre_usuario']
                }
            ]
        });

        const promediosDB = await Valoracion.findAll({
            attributes: [
                'id_publicacion',
                [Sequelize.fn('AVG', Sequelize.col('puntuacion')), 'promedioTotal'],
                [Sequelize.fn('COUNT', Sequelize.col('puntuacion')), 'cantidadVotos']
            ],
            group: ['id_publicacion']
        });

        const mapaPromedios = {};
        promediosDB.forEach(p => {
            mapaPromedios[p.id_publicacion] = {
                promedio: p.get('promedioTotal'),
                cantidad: p.get('cantidadVotos')
            };
        });

        const publicacionesProcesadas = publicacionesDB.map(pub => {
            const fotoPlana = pub.get({ plain: true });
            const idDeLaPub = fotoPlana.id_publicacion || fotoPlana.id;

            fotoPlana.imagenes = obtenerArrayImagenes(fotoPlana.rutas_archivos, idDeLaPub);

            fotoPlana.etiquetasArray = fotoPlana.etiquetas
                ? fotoPlana.etiquetas.split(',').map(e => e.trim())
                : [];

            const datosValoracion = mapaPromedios[idDeLaPub] || { promedio: 0, cantidad: 0 };
            const promedioCrudo = datosValoracion.promedio;

            fotoPlana.promedioFormateado = promedioCrudo ? Number(promedioCrudo).toFixed(1) : '0.0';
            fotoPlana.cantidadVotos = datosValoracion.cantidad;
            // Guardamos como número para el filtro JS
            fotoPlana.promedioNumerico = promedioCrudo ? Number(promedioCrudo) : 0.0;

            return fotoPlana;
        });

        if (orden === 'mejor') {
            publicacionesProcesadas.sort((a, b) => b.promedioNumerico - a.promedioNumerico);
        } else if (orden === 'peor') {
            publicacionesProcesadas.sort((a, b) => a.promedioNumerico - b.promedioNumerico);
        }

        res.render('index', {
            titulo: 'Fotaza 2 - Inicio',
            publicaciones: publicacionesProcesadas,
            usuarioSesion: req.session ? req.session.usuario : null,
            ordenActual: orden
        });

    } catch (error) {
        next(error);
    }
};