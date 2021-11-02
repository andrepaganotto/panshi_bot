import bcrypt from 'bcryptjs';
import crypto from '../utils/crypto.js';
import model from "../models/settingsModel.js";

function getSettings(id) {
    return model.findOne({ where: { id } })
}

function getSettingsByEmail(email) {
    return model.findOne({ where: { email } });
}

async function setSettings(id, newSettings) {
    const currentSettings = await getSettings(id);

    if (newSettings.password)
        currentSettings.password = bcrypt.hashSync(newSettings.password);

    if (newSettings.secretMBTC)
        currentSettings.secretMBTC = crypto.encrypt(newSettings.secretMBTC);

    if (newSettings.secretBNC)
        currentSettings.secretBNC = crypto.encrypt(newSettings.secretBNC);

    if (newSettings.keyMBTC && newSettings.keyMBTC !== currentSettings.keyMBTC)
        currentSettings.keyMBTC = newSettings.keyMBTC;

    if (newSettings.keyBNC && newSettings.keyBNC !== currentSettings.keyBNC)
        currentSettings.keyBNC = newSettings.keyBNC;

    await currentSettings.save();
}

export default { getSettings, getSettingsByEmail, setSettings };