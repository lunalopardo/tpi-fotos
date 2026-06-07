import express from 'express';
import { realizarBusqueda } from '../controllers/buscarController.js'

const router = express.Router();
router.get('/', realizarBusqueda)

export default router;