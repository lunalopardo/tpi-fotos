import Usuario from '../models/usuario.js'
import Publicacion from '../models/publicacion.js'
import { Sequelize, Op } from 'sequelize';

export const realizarBusqueda = async (req, res, next) => {

    try {
        const termino = req.query.busqueda; //el nombre que le pusimos en layout

        if (!termino || termino.trim() === '') {
            return res.redirect('/');
        }

        const publicacionesFiltradas = await Publicacion.findAll({
            where: {
                [Op.or]: [
                    {
                        titulo: { [Op.iLike]: `%${termino}%`}
                    },
                    {
                        descripcion: { [Op.iLike]: `%${termino}%`}
                    },
                    {
                        etiquetas: { [Op.iLike]: `%${termino}%`}
                    }
                ]
            },
            include: [{ model: Usuario, attributes: ['nombre_usuario'] }]
        })

        const publicacionesProcesadas = publicacionesFiltradas.map(pub => {
            const fotoPlana = pub.get({ plain: true });
            
            if (!fotoPlana.rutas_archivos) {
                fotoPlana.imagenes = [];
            } else {
                fotoPlana.imagenes = fotoPlana.rutas_archivos.match(/data:image\/[^;]+;base64,[^,]+/g) || [];
            }
            return fotoPlana;
        });

        const usuariosFiltrados = await Usuario.findAll({
            where: {
                [Op.or]: [
                    { nombre_usuario: { [Op.iLike]: `%${termino}%`} }
                ]
            }

        })
        res.render('publicacion/buscar', {
            titulo: `Resultados para: "${termino}"`,
            publicaciones: publicacionesProcesadas,
            usuarios: usuariosFiltrados,
            terminoBuscado: termino
        });

    } catch (error) {
        next(error);
    }

}