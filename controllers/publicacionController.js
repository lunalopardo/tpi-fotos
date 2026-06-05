import Publicacion from "../models/Publicacion.js";
import Usuario from '../models/usuario.js';
import { Sequelize } from "sequelize";
import { z } from 'zod';

function getAuthenticatedUserId(req) {
    const userId = Number(req.session?.usuario?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
        return null;
    }
    return userId;
}

//Validaciones con zod
const publicacionSchema = z.object({
    titulo: z.string().min(1, 'El título no puede estar vacío').trim(),
    descripcion: z.string().trim().optional(),
    copyright: z.string()
        .refine(val => ['0', '1'].includes(val), {
            message: 'Debe seleccionar una licencia.'
        })
        .transform(val => Number(val)),
    etiquetas: z.string().trim().optional(),
    imagenesBase64: z.array(z.string()).min(1, 'Debés subir al menos una fotografía')
})

// GET Mostrar una publicación
export const getUnaPublicacion = async (req, res) => {
    try {
        const { id } = req.params;
        const publicacionBD = await Publicacion.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    attributes: ['nombre_usuario']
                }
            ]
        });

        if (!publicacionBD) {
            return res.status(404).send('Publicación no encontrada');
        }

        const fotoPlana = publicacionBD.get({ plain: true })

        if (!fotoPlana.rutas_archivos) {
            fotoPlana.imagenes = [];
        } else {
            fotoPlana.imagenes = fotoPlana.rutas_archivos.match(/data:image\/[^;]+;base64,[^,]+/g) || [];
        }

        res.render('publicacion/detalle', {
            titulo: fotoPlana.titulo,
            foto: fotoPlana,
            usuarioSesion: req.session ? req.session.usuario : null
        });


    } catch (error) {
        console.error('Error en getUnaPublicacion:', error);
        res.status(500).send('Error al cargar la info de la publicación');
    }
}

// GET Mostrar vista de nueva publicación
export const getNuevaPublicacion = (req, res) => {
    res.render('publicacion/nuevo', { titulo: 'Nueva publicación' })
}

// POST nueva publicación
export const postNuevaPublicacion = async (req, res) => {

    //vemos si hay usuario logueado
    const idUsuarioAutenticado = getAuthenticatedUserId(req);
    if (!idUsuarioAutenticado) {
        return res.status(401).render('auth/login', { error: 'Debes iniciar sesión primero.' })
    }

    let datosImagenes = req.body['imagenesBase64[]'] || req.body.imagenesBase64;

    if (!datosImagenes) {
        req.body.imagenesBase64 = [];
    } else if (!Array.isArray(datosImagenes)) {
        req.body.imagenesBase64 = [datosImagenes];
    } else {
        req.body.imagenesBase64 = datosImagenes;
    }

    //vemos si zod validó los datos 
    const validacion = publicacionSchema.safeParse(req.body);

    if (!validacion.success) {
        return res.status(400).render('publicacion/nuevo', {
            titulo: 'Nueva Publicación',
            error: validacion.error.issues[0].message,
            formValues: req.body
        });
    }

    const { titulo, descripcion, copyright, etiquetas, imagenesBase64 } = validacion.data;
    const arrayImgenesLimpio = imagenesBase64.filter(img => img.trim() !== '');

    const textoImagenesJuntas = arrayImgenesLimpio.join(',');

    try {

        const nuevaPublicacion = {
            titulo: titulo,
            descripcion: descripcion,
            copyright: copyright,
            etiquetas: etiquetas,
            rutas_archivos: textoImagenesJuntas,
            estado: 'activa',
            id_usuario: idUsuarioAutenticado,
        }

        await guardarPublicacion(nuevaPublicacion);
        res.redirect('/')

    } catch (error) {
        console.error('Error al crear la publicacion: ', error);
        return res.status(500).render('publicacion/nuevo', {
            titulo: 'Nueva Publicación',
            error: 'Hubo un problema al guardar la publicación en la BD',
            formValues: req.body
        })
    }
};

async function guardarPublicacion(post) {
    await Publicacion.create(post);
}