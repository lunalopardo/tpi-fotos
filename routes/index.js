import express from 'express';
import { renderHome } from '../controllers/indexController.js';

const router = express.Router();

router.get('/', renderHome);

export default router;