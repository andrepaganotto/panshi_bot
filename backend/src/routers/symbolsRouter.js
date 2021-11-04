import { Router } from "express";
import controller from '../controllers/symbolsController.js'

const router = Router();

router.get('/', controller.getSymbols);

router.get('/:symbol', controller.getSymbol);

router.post('/sync', controller.syncSymbols);

export default router;