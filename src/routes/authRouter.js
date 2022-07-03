import {cadastrar, logar, sair} from "../controllers/authController.js"
import validateUser from '../middlewares/validateUser.js';
import { Router } from "express"

const router = Router()

router.post("/cadastrar", cadastrar);

router.post("/login", logar);

router.delete("/sair", validateUser, sair)

export default router