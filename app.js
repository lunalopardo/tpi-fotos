import express from 'express';
import dotenv from 'dotenv';
import './models/config.js'; 

dotenv.config();

// Manejo de puerto
if (!process.env.PORT) {
    console.warn("Advertencia: PORT no definido en .env, usando 3000 por defecto.");
}
const PORT = parseInt(process.env.PORT || '3000', 10);

const app = express();

// Motor de plantillas: PUG
app.set('view engine', 'pug');
app.set('views', './views');

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('./public'));
app.use((req, res, next)=>{
  res.locals.currentPath = req.path;
  next()
})


// provisional -> mover a routers
app.get('/', (req,res) =>{
    res.render('index', {titulo: 'Bienvenido a nuestra website!'})
});


// Levantamos el servidor
app.listen(PORT, (err) => {
    if(err){
        console.error('Error al iniciar el servidor: ', err)
        return;
    } else {console.log(`Servidor escuchando en el puerto: ${PORT}`)}
})