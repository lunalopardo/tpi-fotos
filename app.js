import express from 'express';
import dotenv from 'dotenv';
import './models/config.js';
import session from 'express-session';
import indexRouter from './routes/index.js'
import usuarioRouter from './routes/usuario.js'
import authRouter from './routes/auth.js';
import publicacionRouter from './routes/publicacion.js'
import buscarRouter from './routes/buscar.js'
import { manejadorErroresGlobal } from './middleware/errorMiddleware.js'
import { asociarClases } from './models/asociaciones.js';

dotenv.config();
asociarClases(); //todas las asociaciones de clases juntas.

// Manejo de puerto
if (!process.env.PORT) {
    console.warn("Advertencia: PORT no definido en .env, usando 3000 por defecto.");
}
const PORT = parseInt(process.env.PORT || '3000', 10);

const app = express();

// Motor de plantillas: PUG
app.set('view engine', 'pug');
app.set('views', './views');

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('./public'));

// req.session
app.use(session({
    secret: 'clave-secreta-super-segura',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});


app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/publicacion', publicacionRouter);
app.use('/usuario', usuarioRouter);
app.use('/buscar', buscarRouter)

app.use(manejadorErroresGlobal); //Manejamos los errores desde un middleware

// Levantamos el servidor
app.listen(PORT, (err) => {
    if (err) {
        console.error('Error al iniciar el servidor: ', err)
        return;
    } else { console.log(`Servidor escuchando en el puerto: ${PORT}`) }
})