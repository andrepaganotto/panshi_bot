import { Router } from "express";
import controller from "../controllers/exchangeController.js";

const router = Router();

router.get('/balance', controller.getBalance);

router.get('/dolar', controller.getDolar);

export default router;