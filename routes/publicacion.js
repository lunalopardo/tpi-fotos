import express from 'express';
import { getNuevaPublicacion, getUnaPublicacion, postNuevaPublicacion, postNuevoComentario } from '../controllers/publicacionController.js';

const router = express.Router();

router.get( '/nuevo', getNuevaPublicacion);
router.get('/:id', getUnaPublicacion);
router.post('/nuevo', postNuevaPublicacion);

router.post('/:id/comentario', postNuevoComentario)

export default router;