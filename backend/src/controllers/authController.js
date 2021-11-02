import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import settingsRepository from '../repositories/settingsRepository.js';

async function login(req, res) {
    const { email, password } = req.body;
    const userSettings = await settingsRepository.getSettingsByEmail(email);

    if (userSettings) {
        const passwordIsValid = await bcrypt.compare(password, userSettings.password);
        if (passwordIsValid) {
            const token = jwt.sign({ id: userSettings.id }, process.env.JWT_SECRET, { expiresIn: parseInt(process.env.JWT_EXPIRES) })
            return res.json({ token });
        }
    }

    res.status(401).end();
}

const blacklist = [];

function logout(req, res) {
    const token = req.headers['authorization'];
    blacklist.push(token);
    res.status(200).end();
}

export function isBlacklisted(token) {
    return blacklist.some(e => e === token);
}

export default { login, logout };