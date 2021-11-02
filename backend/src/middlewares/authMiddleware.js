import jwt from 'jsonwebtoken';
import { isBlacklisted } from '../controllers/authController.js';

export default ((req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded && !isBlacklisted(token)) {
                res.locals.token = decoded;
                return next();
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    res.status(401).end();
})