import Publicacion from "../models/publicacion.js";
import Usuario from '../models/usuario.js';
import Comentario from '../models/comentario.js';
import Valoracion from '../models/valoracion.js';
import { Sequelize } from "sequelize";
import { z } from 'zod';
import { createCanvas, loadImage } from 'canvas';
import { getAuthenticatedUserId } from '../helpers/auth.js';
import { parsearImagenesBase64 } from '../helpers/imagenesHelper.js';

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
    imagenesBase64: z.array(z.string()).min(1, 'Debés subir al menos una fotografía'),
    marca_agua_texto: z.string().trim().optional().nullable(),
    permitir_comentarios: z.string().optional()
})

const comentarioSchema = z.object({
    contenido: z.string().min(1, 'El comentario no puede estar vacío').trim()
})

// GET Mostrar una publicación
export const getUnaPublicacion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const publicacionBD = await Publicacion.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    attributes: ['nombre_usuario']
                },
                {
                    model: Comentario,
                    include: [{ model: Usuario, attributes: ['nombre_usuario'] }]
                }
            ]
        });


        if (!publicacionBD) {
            return res.status(404).send('Publicación no encontrada');
        }

        //Los mandamos a loguear si escriben el id de una imagen con copyright en la barra de navegación
        const idUsuarioAutenticado = getAuthenticatedUserId(req);

        if (publicacionBD.copyright === 1 && !idUsuarioAutenticado) {
            return res.status(401).render('auth/login', { 
                error: 'Esta publicación está protegida por derechos de autor. Debes iniciar sesión para verla.' 
            });
        }

        const promedioData = await Valoracion.findOne({
            where: { id_publicacion: id },
            attributes: [[Sequelize.fn('AVG', Sequelize.col('puntuacion')), 'total']]
        });

        const fotoPlana = publicacionBD.get({ plain: true })
        fotoPlana.promedioFormateado = Number(promedioData.get('total') || 0).toFixed(1); //promedio con 1 decimal

        if (!fotoPlana.rutas_archivos) {
            fotoPlana.imagenes = [];
        } else {
            fotoPlana.imagenes = parsearImagenesBase64(fotoPlana.rutas_archivos);
        }

        res.render('publicacion/detalle', {
            titulo: fotoPlana.titulo,
            foto: fotoPlana,
            usuarioSesion: req.session ? req.session.usuario : null
        });


    } catch (error) {
        next(error);
    }
}

// GET Mostrar vista de nueva publicación
export const getNuevaPublicacion = (req, res) => {
    res.render('publicacion/nuevo', { titulo: 'Nueva publicación' })
}

// POST nueva publicación
export const postNuevaPublicacion = async (req, res, next) => {

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

    const { titulo, descripcion, copyright, etiquetas, imagenesBase64, marca_agua_texto, permitir_comentarios } = validacion.data;

    try {
        const comentarios_cerrados = permitir_comentarios === 'on' ? 0 : 1;
        let textoMarcaAgua = null;
        let arrayImagenesProcesadas = [];


        if (copyright === 1) {
            textoMarcaAgua = (marca_agua_texto && marca_agua_texto.trim() !== '')
                ? marca_agua_texto.trim()
                : '© PROPIEDAD INTELECTUAL';

            for (const base64Img of imagenesBase64) {
                if (base64Img.trim() === '') continue;

                // Cargamos la imagen en el canvas del servidor
                const img = await loadImage(base64Img);
                const canvas = createCanvas(img.width, img.height);
                const ctx = canvas.getContext('2d');

                ctx.drawImage(img, 0, 0);

                const tamañoFuente = Math.max(img.width / 15, 24);
                ctx.font = `bold ${tamañoFuente}px sans-serif`;
                ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(-30 * Math.PI / 180);
                ctx.fillText(textoMarcaAgua.toUpperCase(), 0, 0);

                // Guardamos el nuevo string base64 protegido
                arrayImagenesProcesadas.push(canvas.toDataURL('image/jpeg', 0.9));
            }
        } else {
            // Si no tiene copyright, usamos las imágenes originales
            arrayImagenesProcesadas = imagenesBase64.filter(img => img.trim() !== '');

        }

        const textoImagenesJuntas = arrayImagenesProcesadas.join(',');

        const nuevaPublicacion = {
            titulo: titulo,
            descripcion: descripcion,
            copyright: copyright,
            marca_agua_texto: textoMarcaAgua,
            comentarios_cerrados,
            etiquetas: etiquetas,
            rutas_archivos: textoImagenesJuntas,
            estado: 'activa',
            id_usuario: idUsuarioAutenticado,
        }

        await guardarPublicacion(nuevaPublicacion);
        res.redirect('/')

    } catch (error) {
        next(error);
    }
};

async function guardarPublicacion(post) {
    await Publicacion.create(post);
}

// COMENTARIOS
//POST nuevo comentario
export const postNuevoComentario = async (req, res) => {

    const { id } = req.params;

    //vemos si hay usuario logueado
    const idUsuarioAutenticado = getAuthenticatedUserId(req);
    if (!idUsuarioAutenticado) {
        return res.status(401).render('auth/login', { error: 'Debes iniciar sesión primero.' })
    }

    const validacion = comentarioSchema.safeParse(req.body);

    if (!validacion.success) {
        return res.redirect('/publicacion/' + id);
    }

    try {
        const comentarioTexto = validacion.data.contenido;
        const nuevoComentario = {
            id_usuario: idUsuarioAutenticado,
            id_publicacion: id,
            contenido: comentarioTexto
        }

        await Comentario.create(nuevoComentario);
        res.redirect('/publicacion/' + id)
    } catch (error) {
        console.error('Error al publicar el comentario: ', error);
        return res.status(500).render('publicacion' + id)

    }
}


// VALORACIONES
export const valorarPublicacion = async (req, res, next) => {
    try {
        const id_publicacion = parseInt(req.params.id, 10);
        const puntuacion = parseInt(req.body.puntuacion, 10);

        // Control 1: ¿El usuario está logueado en la sesión?
        const idUsuarioAutenticado = getAuthenticatedUserId(req);
        if (!idUsuarioAutenticado) {
            return res.send(`<script>alert("Debe iniciar sesión primero para poder valorar."); window.history.back();</script>`);
        }

        // Buscamos la publicación para verificar la autoría
        const publicacion = await Publicacion.findByPk(id_publicacion);
        if (!publicacion) {
            return res.status(404).send('La publicación no existe.');
        }

        // Control 2: Impedir el auto-voto
        if (publicacion.id_usuario === idUsuarioAutenticado) {
            return res.send(`<script>alert("No podés votar tus propias publicaciones."); window.history.back();</script>`);
        }

        // Control 3: Evitar duplicados
        const yaVoto = await Valoracion.findOne({
            where: {
                id_usuario: idUsuarioAutenticado,
                id_publicacion: id_publicacion
            }
        });

        if (yaVoto) {
            return res.send(`<script>alert("Ya valoraste esta publicación anteriormente."); window.history.back();</script>`);
        }

        // Si pasó todos los controles, guardamos en la tabla intermedia
        await Valoracion.create({
            id_usuario: idUsuarioAutenticado,
            id_publicacion: id_publicacion,
            puntuacion: puntuacion
        });

        // Éxito total: volvemos a la página limpia
        return res.redirect('/publicacion/' + id_publicacion);

    } catch (error) {
        next(error);
    }
};