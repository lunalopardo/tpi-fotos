import Publicacion from '../models/publicacion.js';
import Usuario from '../models/usuario.js';
import Seguidor from '../models/seguidor.js';
import { Op, Sequelize } from 'sequelize';
import { getAuthenticatedUserId } from '../helpers/auth.js';
import { obtenerArrayImagenes } from '../helpers/imagenesHelper.js';



// GET - Mostrar perfil de usuario (SOLO DE OTRAS PERSONAS)
export const getPerfil = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = getAuthenticatedUserId(req);

        if (isNaN(id)) {
            return res.status(400).send('ID de usuario inválido');
        }

        const usuarioBD = await Usuario.findByPk(id, {
            attributes: ['id_usuario', 'nombre_usuario', 'email']
        });

        if (!usuarioBD) {
            return res.status(404).send('Usuario no encontrado');
        }

        const publicacionesBD = await Publicacion.findAll({
            where: { id_usuario: id },
            order: [['id_publicacion', 'DESC']]
        });

        // PARSEO IGUAL AL INDEX
        const publicacionesDeUser = publicacionesBD.map(pub => {
            const fotoPlana = pub.get({ plain: true });
            const idDeLaPub = fotoPlana.id_publicacion;
            fotoPlana.imagenes = obtenerArrayImagenes(fotoPlana.rutas_archivos, idDeLaPub);

            return fotoPlana;
        });

        const countSeguidores = await Seguidor.count({ where: { id_seguido: id } });
        const countSeguidos = await Seguidor.count({ where: { id_seguidor: id } });

        let yaLoSigue = false;
        if (currentUserId && currentUserId !== Number(id)) {
            const seguimiento = await Seguidor.findOne({
                where: {
                    id_seguido: id,
                    id_seguidor: currentUserId
                }
            });
            yaLoSigue = !!seguimiento;
        }

        res.render('usuario/perfil', {
            titulo: `Perfil de @${usuarioBD.nombre_usuario}`,
            perfilUsuario: usuarioBD,
            publicaciones: publicacionesDeUser,
            stats: {
                publicaciones: publicacionesDeUser.length,
                seguidores: countSeguidores,
                seguidos: countSeguidos
            },
            yaLoSigue: yaLoSigue
        });

    } catch (error) {
        next(error);
    }
};

// GET - Mostrar el perfil del usuario LOGUEADO (/usuario/perfil)
export const getMiPerfil = async (req, res, next) => {
    try {
        const currentUserId = getAuthenticatedUserId(req);

        if (!currentUserId) {
            return res.redirect('/auth/login');
        }

        const usuarioBD = await Usuario.findByPk(currentUserId, {
            attributes: ['id_usuario', 'nombre_usuario', 'email']
        });

        if (!usuarioBD) {
            return res.status(404).send('Usuario no encontrado');
        }

        const publicacionesBD = await Publicacion.findAll({
            where: { id_usuario: currentUserId },
            order: [['id_publicacion', 'DESC']]
        });

        // PARSEO IGUAL AL INDEX
        const publicacionesDeUser = publicacionesBD.map(pub => {
            const fotoPlana = pub.get({ plain: true });
            const idDeLaPub = fotoPlana.id_publicacion;
            fotoPlana.imagenes = obtenerArrayImagenes(fotoPlana.rutas_archivos, idDeLaPub);

            return fotoPlana;
        });

        const countSeguidores = await Seguidor.count({ where: { id_seguido: currentUserId } });
        const countSeguidos = await Seguidor.count({ where: { id_seguidor: currentUserId } });

        res.render('usuario/perfil', {
            titulo: 'Mi Perfil',
            perfilUsuario: usuarioBD,
            publicaciones: publicacionesDeUser,
            stats: {
                publicaciones: publicacionesDeUser.length,
                seguidores: countSeguidores,
                seguidos: countSeguidos
            },
            yaLoSigue: false
        });

    } catch (error) {
        next(error);
    }
};

// POST - Seguir/Dejar de seguir a un usuario (/usuario/seguir/:id)
export const toggleSeguirUsuario = async (req, res, next) => {
    try {
        const idSeguido = parseInt(req.params.id, 10);
        const idSeguidor = getAuthenticatedUserId(req);

        if (!idSeguidor) {
            return res.status(401).send('Debes iniciar sesión para seguir usuarios.');
        }

        if (idSeguidor === idSeguido) {
            return res.send(`<script>alert("No podés seguirte a vos mismo."); window.history.back();</script>`);
        }

        // Verificar si ya existe la relación en la tabla intermedia
        const yaLoSigue = await Seguidor.findOne({
            where: {
                id_seguido: idSeguido,
                id_seguidor: idSeguidor
            }
        });

        if (yaLoSigue) {
            // Si ya lo seguía, lo borramos (Dejar de seguir)
            await yaLoSigue.destroy();
        } else {
            // Si no lo seguía, lo creamos (Seguir)
            await Seguidor.create({
                id_seguido: idSeguido,
                id_seguidor: idSeguidor
            });
        }

        // Redireccionamos de vuelta al perfil para ver los cambios reflejados
        return res.redirect(`/usuario/${idSeguido}`);

    } catch (error) {
        next(error);
    }
};

// Traemos los seguidores para mostrarlos en una vista sencilla.
export const getSeguidores = async (req, res) => {
    const { id } = req.params;
    const tipo = req.query.tipo; // 'seguidores' o 'seguidos'

    const usuario = await Usuario.findByPk(id, {
        include: [{
            model: Usuario,
            as: tipo === 'seguidos' ? 'misSeguidos' : 'misSeguidores',
            attributes: ['id_usuario', 'nombre_usuario']
        }]
    });

    const lista = tipo === 'seguidos' ? usuario.misSeguidos : usuario.misSeguidores;

    res.render('usuario/seguidos', {
        titulo: tipo === 'seguidos' ? 'A quienes sigue' : 'Sus seguidores',
        lista: lista
    });
};