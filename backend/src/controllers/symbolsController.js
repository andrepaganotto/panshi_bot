import repository from "../repositories/symbolsRepository.js";
import settingsRepository from "../repositories/settingsRepository.js";
import exchangeApi from '../utils/exchange.js'

async function getSymbol(req, res) {
    const symbol = await repository.getSymbol(req.params.symbol);
    return res.json(symbol);
}

async function getSymbols(req, res) {
    const symbols = await repository.getSymbols();
    return res.json(symbols);
}

async function syncSymbols(req, res) {
    const settings = await settingsRepository.getDecryptedSettings();
    const exchange = exchangeApi(settings);
    const BINANCE = exchange.Binance();
    const MERCADO = exchange.MercadoBitcoin();

    const symbolsNames = await BINANCE.getAllCoinsInfo();
    const symbolsMBTC = (Object.keys((await MERCADO.getAccountInfo()).balance)).map(e => e.toUpperCase());
    const symbolsBNC = (((await BINANCE.exchangeInfo()).symbols).filter(s => s.quoteAsset === 'USDT'))
        .filter(symbol => symbolsMBTC.some(s => (s.slice(0, symbol.baseAsset.length)) === symbol.baseAsset));

    const symbolist = symbolsBNC.map(symbol => {
        const lotSizeFilter = symbol.filters.find(f => f.filterType === 'LOT_SIZE');
        const symbolInfo = symbolsNames.find(f => f.coin === symbol.baseAsset);

        return {
            currency: symbol.baseAsset,
            name: symbolInfo ? symbolInfo.name : symbol.baseAsset,
            symbolMBTC: `BRL${symbolsMBTC.find(e => e.slice(0, symbol.baseAsset.length) === symbol.baseAsset)}`,
            symbolBNC: `${symbol.baseAsset}${symbol.quoteAsset}`,
            precisionBNC: lotSizeFilter ? (-Math.floor(Math.log10(parseFloat(lotSizeFilter.minQty)) + 1) + 1) : 0,
            margin: symbol.isMarginTradingAllowed
        }
    });

    await repository.deleteAll();
    await repository.syncSymbols(symbolist);

    return res.status(200).end();
}

export default { getSymbol, getSymbols, syncSymbols };