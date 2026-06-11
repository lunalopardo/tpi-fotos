import Publicacion from "../models/publicacion.js";
import Usuario from '../models/usuario.js';
import Comentario from '../models/comentario.js';
import Valoracion from '../models/valoracion.js';
import { Sequelize } from "sequelize";
import sequelize from '../models/config.js';
import { z } from 'zod';
import { createCanvas, loadImage } from 'canvas';
import { getAuthenticatedUserId } from '../helpers/auth.js';
import { obtenerArrayImagenes } from '../helpers/imagenesHelper.js';

// Validaciones con zod
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
                { model: Usuario, attributes: ['id_usuario', 'nombre_usuario'] },
                { model: Comentario, include: [{ model: Usuario, attributes: ['id_usuario', 'nombre_usuario'] }] }
            ]
        });

        if (!publicacionBD) {
            return res.status(404).send('Publicación no encontrada');
        }

        const idUsuarioAutenticado = getAuthenticatedUserId(req);
        if (publicacionBD.copyright === 1 && !idUsuarioAutenticado) {
            return res.status(401).render('auth/login', {
                error: 'Esta publicación está protegida por derechos de autor. Debes iniciar sesión para verla.'
            });
        }

        
        let miVoto = 0;
        if (idUsuarioAutenticado) {
            const valoracionExistente = await Valoracion.findOne({
                where: { id_publicacion: id, id_usuario: idUsuarioAutenticado }
            });
            if (valoracionExistente) {
                miVoto = valoracionExistente.puntuacion;
            }
        }

        const promedioData = await Valoracion.findOne({
            where: { id_publicacion: id },
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('puntuacion')), 'total'],
                [Sequelize.fn('COUNT', Sequelize.col('puntuacion')), 'cantidadVotos']
            ]
        });

        const fotoPlana = publicacionBD.get({ plain: true });
        fotoPlana.imagenes = obtenerArrayImagenes(fotoPlana.rutas_archivos, fotoPlana.id_publicacion);
        fotoPlana.promedioFormateado = promedioData && promedioData.get('total') ? Number(promedioData.get('total')).toFixed(1) : '0.0';

        fotoPlana.cantidadVotos = promedioData ? promedioData.get('cantidadVotos') : 0;
        fotoPlana.miVoto = miVoto;

        res.render('publicacion/detalle', {
            titulo: fotoPlana.titulo,
            foto: fotoPlana,
            usuarioSesion: req.session ? req.session.usuario : null,
        });

    } catch (error) {
        next(error);
    }
};

// GET Mostrar vista de nueva publicación
export const getNuevaPublicacion = (req, res) => {
    res.render('publicacion/nuevo', { titulo: 'Nueva publicación' })
}

// POST nueva publicación
export const postNuevaPublicacion = async (req, res, next) => {
    const idUsuarioAutenticado = getAuthenticatedUserId(req);
    if (!idUsuarioAutenticado) {
        return res.status(401).render('auth/login', { error: 'Debes iniciar sesión primero.' });
    }

    let datosImagenes = req.body['imagenesBase64[]'] || req.body.imagenesBase64;
    req.body.imagenesBase64 = !datosImagenes ? [] : (!Array.isArray(datosImagenes) ? [datosImagenes] : datosImagenes);

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
        let textoMarcaAgua = copyright === 1 ? (marca_agua_texto?.trim() || '© PROPIEDAD INTELECTUAL') : null;
        let arrayImagenesProcesadas = [];

        for (const base64Img of imagenesBase64) {
            if (base64Img.trim() === '') continue;

            const img = await loadImage(base64Img);

            //Limitamos las imágenes para que no sean muy grandes luego de subirlas
            const MAX_ANCHO = 1200;
            let anchoFinal = img.width;
            let altoFinal = img.height;

            if (img.width > MAX_ANCHO) {
                altoFinal = Math.round((img.height * MAX_ANCHO) / img.width);
                anchoFinal = MAX_ANCHO;
            }

            const canvas = createCanvas(anchoFinal, altoFinal);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, anchoFinal, altoFinal);

            if (copyright === 1) {
                const tamañoFuente = Math.max(anchoFinal / 15, 24);
                ctx.font = `bold ${tamañoFuente}px sans-serif`;
                ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(-30 * Math.PI / 180);
                ctx.fillText(textoMarcaAgua.toUpperCase(), 0, 0);
            }

            // Calidad en 0.8 (80%)
            arrayImagenesProcesadas.push(canvas.toDataURL('image/jpeg', 0.8));
        }

        const textoImagenesJuntas = arrayImagenesProcesadas.join('|');

        await Publicacion.create({
            titulo,
            descripcion,
            copyright,
            marca_agua_texto: textoMarcaAgua,
            comentarios_cerrados,
            etiquetas,
            rutas_archivos: textoImagenesJuntas,
            estado: 'activa',
            id_usuario: idUsuarioAutenticado,
        });

        res.redirect('/');
    } catch (error) {
        next(error);
    }
};

export const getImagenIndividual = async (req, res, next) => {
    try {
        const { id, index } = req.params;

        // Buscamos SOLO la columna de las imágenes para que la query sea instantánea
        const publicacion = await Publicacion.findByPk(id, {
            attributes: ['rutas_archivos']
        });

        if (!publicacion || !publicacion.rutas_archivos) {
            return res.status(404).send('Imagen no encontrada');
        }

        const imagenes = publicacion.rutas_archivos.split('|');
        const base64Img = imagenes[parseInt(index, 10)];

        if (!base64Img) {
            return res.status(404).send('Imagen no encontrada');
        }

        // Convertimos el string Base64 en bytes puros (Buffer)
        const base64Data = base64Img.replace(/^data:image\/\w+;base64,/, "");
        const bufferBinario = Buffer.from(base64Data, 'base64');

        res.set('Content-Type', 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=86400'); // Cache de 1 día para mejor velocidad

        return res.send(bufferBinario);

    } catch (error) {
        next(error);
    }
};

// COMENTARIOS
export const postNuevoComentario = async (req, res) => {
    const { id } = req.params;
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

        const idUsuarioAutenticado = getAuthenticatedUserId(req);
        if (!idUsuarioAutenticado) {
            return res.send(`<script>alert("Debe iniciar sesión primero para poder valorar."); window.history.back();</script>`);
        }

        const publicacion = await Publicacion.findByPk(id_publicacion);
        if (!publicacion) {
            return res.status(404).send('La publicación no existe.');
        }

        if (publicacion.id_usuario === idUsuarioAutenticado) {
            return res.send(`<script>alert("No podés votar tus propias publicaciones."); window.history.back();</script>`);
        }

        const yaVoto = await Valoracion.findOne({
            where: {
                id_usuario: idUsuarioAutenticado,
                id_publicacion: id_publicacion
            }
        });

        if (yaVoto) {
            await yaVoto.update({ puntuacion: puntuacion });
        } else {
            await Valoracion.create({
                id_usuario: idUsuarioAutenticado,
                id_publicacion: id_publicacion,
                puntuacion: puntuacion
            });
        }

        const promedioData = await Valoracion.findOne({
            where: { id_publicacion: id_publicacion },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('puntuacion')), 'promedio'],
                [sequelize.fn('COUNT', sequelize.col('puntuacion')), 'cantidad']
            ]
        });

        // Respondemos un JSON en vez de redirigir
        return res.json({
            nuevoPromedio: parseFloat(promedioData.get('promedio')).toFixed(1),
            nuevaCantidad: promedioData.get('cantidad')
        });
    } catch (error) {
        next(error);
    }
};