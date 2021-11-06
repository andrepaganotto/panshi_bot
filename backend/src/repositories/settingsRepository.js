import bcrypt from 'bcryptjs';
import crypto from '../utils/crypto.js';
import model from "../models/settingsModel.js";

function getSettings(id) {
    return model.findOne({ where: { id } })
}

function getSettingsByEmail(email) {
    return model.findOne({ where: { email } });
}

let settingsCache = {};
async function getDecryptedSettings(id) {
    let settings = settingsCache[id];

    if (!settings) {
        settings = id ? await getSettings(id) : await getDefaultSettings();
        settings.secretMBTC = crypto.decrypt(settings.secretMBTC);
        settings.secretBNC = crypto.decrypt(settings.secretBNC);
        settingsCache[id] = settings;
    }

    return settings;
}

async function getDefaultSettings() {
    return model.findOne();
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

async function incrementNonce(id) {
    const user = await getSettings(id);
    user.increment('nonceMBTC');
    await user.save();
    return (user.nonceMBTC);
}

async function getDolarPrice() {
    return (await getDefaultSettings()).dolar;
}

async function setDolarPrice(price) {
    const user = await getDefaultSettings();
    user.dolar = price;
    await user.save();
    return user.dolar;
}

export default { getSettings, getSettingsByEmail, getDecryptedSettings, getDefaultSettings, setSettings, incrementNonce, getDolarPrice, setDolarPrice };