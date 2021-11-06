import loadExchanges from '../utils/loadExchanges.js';
import settingsRepository from '../repositories/settingsRepository.js';

async function getBalance(req, res, next) {
    const { MERCADO, BINANCE } = await loadExchanges(res.locals.token.id);

    async function getData() {
        const wallet = {};
        try {
            wallet['MBTC'] = (await MERCADO.getAccountInfo()).balance.brl;
            wallet['BNC'] = (await BINANCE.getAccountInfo()).balances.find(asset => asset.asset === 'USDT');
            wallet['dolar'] = await settingsRepository.getDolarPrice();

            res.json(wallet);
        } catch (err) {
            console.error(err);
            res.status(400).json(err.body || err.message);
        };
    }
    getData();
}

async function getDolar(req, res, next) {
    return res.json(await settingsRepository.getDolarPrice());
}

export default { getBalance, getDolar };