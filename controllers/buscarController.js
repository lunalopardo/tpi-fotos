import Usuario from '../models/usuario.js';
import Publicacion from '../models/publicacion.js';
import Valoracion from '../models/valoracion.js';
import { Sequelize, Op } from 'sequelize';
import { parsearImagenesBase64 } from '../helpers/imagenesHelper.js';
import { getAuthenticatedUserId } from '../helpers/auth.js';

export const realizarBusqueda = async (req, res, next) => {
    try {
        const termino = req.query.busqueda;
        const orden = req.query.orden || 'reciente';
        const idUsuarioAutenticado = getAuthenticatedUserId(req);

        if (!termino || termino.trim() === '') {
            return res.redirect('/');
        }

        let ordenSequelize = [['fecha_subida', 'DESC']];
        if (orden === 'antiguo') {
            ordenSequelize = [['fecha_subida', 'ASC']];
        }

        const publicacionesFiltradas = await Publicacion.findAll({
            where: {
                [Op.or]: [
                    { titulo: { [Op.iLike]: `%${termino}%` } },
                    { descripcion: { [Op.iLike]: `%${termino}%` } },
                    { etiquetas: { [Op.iLike]: `%${termino}%` } }
                ]
            },
            include: [{ model: Usuario, attributes: ['nombre_usuario'] }],
            order: ordenSequelize
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

        // Aplicamos el filtro de copyright acá y procesamos la info
        const publicacionesProcesadas = publicacionesFiltradas
            .filter(pub => {
                if (!idUsuarioAutenticado && pub.copyright === 1) return false;
                return true;
            })
            .map(pub => {
                const fotoPlana = pub.get({ plain: true });
                fotoPlana.imagenes = parsearImagenesBase64(fotoPlana.rutas_archivos);

                const idDeLaPub = fotoPlana.id_publicacion || fotoPlana.id;
                const promedioCrudo = mapaPromedios[idDeLaPub];

                fotoPlana.promedioFormateado = promedioCrudo ? Number(promedioCrudo).toFixed(1) : '0.0';

                // Guardamos el valor como número para poder comparar con el .sort() para el filtro
                fotoPlana.promedioNumerico = promedioCrudo ? Number(promedioCrudo) : 0.0;

                return fotoPlana;
            });

        if (orden === 'mejor') {
            publicacionesProcesadas.sort((a, b) => b.promedioNumerico - a.promedioNumerico);
        } else if (orden === 'peor') {
            publicacionesProcesadas.sort((a, b) => a.promedioNumerico - b.promedioNumerico);
        }

        const usuariosFiltrados = await Usuario.findAll({
            where: {
                [Op.or]: [
                    { nombre_usuario: { [Op.iLike]: `%${termino}%` } }
                ]
            }
        });

        res.render('publicacion/buscar', {
            titulo: `Resultados para: "${termino}"`,
            publicaciones: publicacionesProcesadas,
            usuarios: usuariosFiltrados,
            terminoBuscado: termino,
            ordenActual: orden
        });

    } catch (error) {
        next(error);
    }
};