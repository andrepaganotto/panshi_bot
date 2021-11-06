import settingsRepository from '../repositories/settingsRepository.js';
import exchangeApi from './exchange.js';

export default async function loadExchanges(id) {
    const settings = await settingsRepository.getDecryptedSettings(id);
    const exchange = exchangeApi(settings);
    const BINANCE = exchange.Binance();
    const MERCADO = exchange.MercadoBitcoin();

    return { BINANCE, MERCADO };
}