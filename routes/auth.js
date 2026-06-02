import express from 'express';
import { getLogin, postLogin, getRegistro, postRegistro, logout } from '../controllers/authController.js';
import { redirigirSiLogueado } from '../middleware/auth.js';

const router = express.Router();

router.get('/login', redirigirSiLogueado, getLogin);
router.post('/login', postLogin);

router.get('/registro', redirigirSiLogueado, getRegistro);
router.post('/registro', postRegistro);

router.get('/logout', logout);

export default router;