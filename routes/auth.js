import express from 'express';
import { getLogin, postLogin, getRegistro, postRegistro, logout } from '../controllers/authController.js';

const router = express.Router();

router.get('/login', getLogin);
router.post('/login', postLogin);

router.get('/registro', getRegistro);
router.post('/registro', postRegistro);

router.get('/logout', logout);

export default router;