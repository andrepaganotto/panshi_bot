import express from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

//Middlewares
import authMiddleware from './middlewares/authMiddleware.js';
import errorMiddleware from './middlewares/errorMiddleware.js'

app.use(express.json());
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));

//Routes
import authController from './controllers/authController.js';
app.post('/login', authController.login);
app.post('/logged', authMiddleware, (req, res) => res.status(200).end());

import settingsRouter from './routers/settingsRouter.js';
app.use('/settings', authMiddleware, settingsRouter);

app.post('/logout', authController.logout);

app.use(errorMiddleware);

export default app;