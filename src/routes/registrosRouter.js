import {cadastrarRegistro, renderizarRegistros} from "../controllers/registroController.js"
import validateUser from '../middlewares/validateUser.js';
import { Router } from 'express';

const router = Router()

router.post("/registros", validateUser, cadastrarRegistro);

router.get("/registros", validateUser, renderizarRegistros);

export default router