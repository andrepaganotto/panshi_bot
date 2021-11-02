import repository from "../repositories/settingsRepository.js";

async function getSettings(req, res) {
    const account = await repository.getSettings(res.locals.token.id);
    return res.json({
        email: account.email,
        keyMBTC: account.keyMBTC,
        keyBNC: account.keyBNC
    });
}

async function setSettings(req, res) {
    await repository.setSettings(res.locals.token.id, req.body);
    res.status(200).end();
}

export default { getSettings, setSettings };