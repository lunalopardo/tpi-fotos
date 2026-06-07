import Usuario from '../models/usuario.js'
import { z } from 'zod';
import { encriptarContrasenia, verificarContrasenia } from '../helpers/hash.js';

// Validaciones con zod
const loginSchema = z.object({
    email: z.string().email('Email inválido').trim(),
    contrasenia: z.string().min(1, 'La contraseña no puede estar vacía').trim()
})

const registroSchema = z.object({
    nombre_usuario: z.string().min(3, 'El usuario debe tener al menos 3 caracteres').trim(),
    email: z.string().email('Email inválido').trim(),
    contrasenia: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').trim()
})


// GET - Mostrar login
export const getLogin = (req, res) => {
    res.render('auth/login', { titulo: 'Iniciar Sesión' })
}

// GET - Mostrar registro
export const getRegistro = (req, res) => {
    res.render('auth/registro', { titulo: 'Registrarse' })
}

// POST - Login
export const postLogin = async (req, res, next) => {
    const validacion = loginSchema.safeParse(req.body);

    if (!validacion.success) {
        return res.status(400).render('auth/login', {
            error: validacion.error.issues[0].message, formValues: req.body
        });
    }

    const { email, contrasenia } = validacion.data;

    try {
        const usuario = await Usuario.findOne({ where: { email } });
        const esValida = usuario ? await verificarContrasenia(contrasenia, usuario.contrasenia) : false;

        if (!usuario || !esValida) {
            return res.status(400).render('auth/login', {
                error: 'Usuario o contraseña incorrectos.',
                formValues: req.body
            });
        }

        req.session.usuario = {
            id: usuario.id_usuario,
            nombre: usuario.nombre_usuario,
            rol: usuario.rol
        };

        return res.redirect('/');

    } catch (error) {
        next(error);
    }
}

// POST - Registro
export const postRegistro = async (req, res, next) => {
    const validacion = registroSchema.safeParse(req.body);

    if (!validacion.success) {
        return res.status(400).render('auth/registro', {
            error: validacion.error.issues[0].message, formValues: req.body
        });
    }

    const { nombre_usuario, email, contrasenia } = validacion.data;

    try {
        const contraseniaEncriptada = await encriptarContrasenia(contrasenia);
        await Usuario.create({ nombre_usuario, email, contrasenia:contraseniaEncriptada });
        return res.redirect('/auth/login');

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).render('auth/registro', {
                error: 'El nombre de usuario o email ya están registrados.',
                formValues: req.body
            });
        }
        next(error);
    }
};

// GET - Cerrar sesión
export const logout = (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) console.error('Error cerrando sesión:', err);
            res.redirect('/auth/login');
        });
    } else {
        res.redirect('/auth/login');
    }
};