import { Router } from "express";
import controller from "../controllers/settingsController.js";

const router = Router();

router.get('/', controller.getSettings);

router.patch('/', controller.setSettings);

export default router;