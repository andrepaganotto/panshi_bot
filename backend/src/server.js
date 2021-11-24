import app from "./app.js";
import database from './db.js'

import settingsRepository from "./repositories/settingsRepository.js";
import automationsRepository from "./repositories/automationsRepository.js";

import exchangeMonitor from './app-em.js';
import webSocketApp from './app-ws.js';
import panshi from "./panshi.js";

(async () => {
    try {
        await database.sync();
        console.log(`Running database: ${process.env.DB_NAME}`);

        const port = parseInt(process.env.PORT);
        const server = app.listen(port, () => console.log(`Running on port: ${port}`));

        const wss = webSocketApp(server);
        const settings = await settingsRepository.getDecryptedSettings();

        const automations = await automationsRepository.getActiveAutomations();
        panshi.init(settings, automations, wss);
        exchangeMonitor.init(settings, wss, panshi);
    }
    catch (err) {
        console.error(err);
    }

})();
