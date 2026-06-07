import express from 'express';
import { getNuevaPublicacion, getUnaPublicacion, postNuevaPublicacion, postNuevoComentario } from '../controllers/publicacionController.js';
import { protegerRuta } from '../middleware/authMiddleware.js'; //con esto sacamos a los usuarios no registrados de las vistas que no deberían poder ver.

const router = express.Router();

router.get( '/nuevo', protegerRuta, getNuevaPublicacion);
router.get('/:id', protegerRuta, getUnaPublicacion);
router.post('/nuevo', protegerRuta, postNuevaPublicacion);

router.post('/:id/comentario', protegerRuta, postNuevoComentario)

export default router;