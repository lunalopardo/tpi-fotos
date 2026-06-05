import express from 'express';
import { getNuevaPublicacion, getUnaPublicacion, postNuevaPublicacion } from '../controllers/publicacionController.js';
const router = express.Router();

router.get( '/nuevo', getNuevaPublicacion);

router.post('/nuevo', postNuevaPublicacion)

export default router;