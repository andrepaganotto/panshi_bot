import { Router } from "express";
import controller from '../controllers/automationsController.js'
import orderMiddleware from "../middlewares/orderMiddleware.js";

const router = Router();

router.get('/brain', controller.getPanshiBrain);

router.get('/memory', controller.getPanshiMemory);

router.get('/', controller.getAutomations);

router.get('/:id', controller.getAutomation);

router.post('/', orderMiddleware, controller.insertAutomation);

router.delete('/:id', controller.cancelAutomation);

export default router;