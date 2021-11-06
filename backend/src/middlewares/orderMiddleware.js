import loadExchanges from "../utils/loadExchanges.js"
import symbolsRepository from '../repositories/symbolsRepository.js'

export default (async (req, res, next) => {
    const { MERCADO, BINANCE } = await loadExchanges(res.locals.token.id);
    const automation = req.body;

    const balMBTC = (await MERCADO.getAccountInfo()).balance;
    const balBNC = (await BINANCE.getAccountInfo()).balances;
    const balMargin = parseFloat((await BINANCE.margin.getAccountInfo()).totalNetAssetOfBtc);

    let hasBalBNC, hasBalMBTC, canBuy, canSell;

    const l = automation.second ? 2 : 1;
    for (let i = 1; i <= l; i++) {
        const { symbolMBTC, symbolBNC, currency } = await symbolsRepository.getSymbol(automation.symbol);
        const { side, vol } = automation[`${i === 1 ? 'first' : 'second'}`];

        const lastMBTC = parseFloat(await MERCADO.lastPrice(symbolMBTC));
        const lastBNC = parseFloat((await BINANCE.lastPrice(symbolBNC)).price);

        if (side === 'BUY') {
            if (automation.second && canSell && (automation.second.vol <= automation.first.vol))
                return next();
            else {
                const total = parseFloat(vol * lastMBTC).toFixed(6);
                hasBalMBTC = (total <= parseFloat(balMBTC.brl.available));
                if (automation.margin) {
                    const lastBtcPrice = (await BINANCE.lastPrice('BTCUSDT')).price;
                    const equivalentVol = parseFloat((parseFloat(balMargin.totalNetAssetOfBtc) * parseFloat(lastBtcPrice)) / lastBNC).toFixed(8);
                    hasBalBNC = equivalentVol >= vol;
                }
                else hasBalBNC = parseFloat(balBNC.find(bal => bal.asset === currency).free) >= vol;

                if (hasBalMBTC && hasBalBNC) canBuy = true;
                console.log('Can buy');
                if (canBuy && !automation.second) return next();
            }
        }
        else if (side === 'SELL') {
            if (automation.second && canBuy && (automation.second.vol <= automation.first.vol))
                return next(); //Default buy sell operation
            else {
                hasBalMBTC = parseFloat(balMBTC[symbolMBTC.replace('BRL', '').toLowerCase()].available) >= vol;
                if (automation.margin) {
                    const lastBtcPrice = parseFloat((await BINANCE.lastPrice('BTCUSDT')).price);
                    const equivalentVol = balMargin * lastBtcPrice;
                    hasBalBNC = equivalentVol >= (vol * lastBNC);
                }
                else hasBalBNC = parseFloat(balBNC.find(bal => bal.asset === 'USDT').free) >= (vol * lastBNC);

                if (hasBalMBTC && hasBalBNC) canSell = true;
                console.log('Can sell');
                if (canSell && !automation.second) return next();
            }
        }
    }

    return res.status(403).send('Saldo insuficiente').end();
})