import express from 'express';
import { getNuevaPublicacion, getUnaPublicacion, postNuevaPublicacion, postNuevoComentario, valorarPublicacion, getImagenIndividual } from '../controllers/publicacionController.js';
import { protegerRuta } from '../middleware/authMiddleware.js';
import { realizarBusqueda } from '../controllers/buscarController.js';

const router = express.Router();

router.get('/nuevo', protegerRuta, getNuevaPublicacion);
router.post('/nuevo', protegerRuta, postNuevaPublicacion);
router.get('/buscar', realizarBusqueda);

router.get('/foto/:id/:index', getImagenIndividual);

router.get('/:id', getUnaPublicacion);

router.post('/:id/comentario', protegerRuta, postNuevoComentario);
router.post('/:id/valorar', valorarPublicacion);

export default router;