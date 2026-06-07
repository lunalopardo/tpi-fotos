import express from 'express';
import { getLogin, postLogin, getRegistro, postRegistro, logout } from '../controllers/authController.js';
import { redirigirSiLogueado } from '../middleware/authMiddleware.js'; // Manda al user logueado al inicio para que no pueda volver a entrar a la vista de login o registro

const router = express.Router();

router.get('/login', redirigirSiLogueado, getLogin);
router.post('/login', postLogin);

router.get('/registro', redirigirSiLogueado, getRegistro);
router.post('/registro', postRegistro);

router.get('/logout', logout);

export default router;