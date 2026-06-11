import express from 'express';
import { protegerRuta } from '../middleware/authMiddleware.js';
import { getPerfil, getMiPerfil, toggleSeguirUsuario, getSeguidores} from '../controllers/usuarioController.js'

const router = express.Router()

router.get('/perfil', protegerRuta, getMiPerfil);

router.post('/seguir/:id', protegerRuta, toggleSeguirUsuario);

router.get('/:id', protegerRuta, getPerfil);

router.get('/:id/relaciones', getSeguidores);


export default router;