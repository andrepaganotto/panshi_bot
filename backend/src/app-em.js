import exchangeApi, { getDolarPrice } from "./utils/exchange.js";
import { CronJob } from 'cron';

import symbolsRepository from "./repositories/symbolsRepository.js";
import settingsRepository from "./repositories/settingsRepository.js";
import { monitorTypes } from './utils/types.js';

let WSS, PANSHI, BINANCE, MERCADO;

let allSymbols, dolar;
const pricesMBTC = {}, pricesBNC = {}, agios = [];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function startBookMonitor({ symbol }) {
    if (!BINANCE) throw new Error('Exchanges not initialized yet!');

    BINANCE.bookDepthStream(symbol, async (book) => {
        await PANSHI.updateMemory(symbol.replace('USDT', ''), monitorTypes.BOOK, book);
    })
}

function stopBookMonitor(symbol) {
    BINANCE.terminateBookDepthStream(`${symbol}USDT`);
}

const orderPolls = {};
async function startOrderMonitor({ symbol, orderId, interval }) {
    if (!MERCADO) throw new Error('Exchanges not initialized yet!');

    orderPolls[`${orderId}`] = setInterval(async () => {
        const req = await MERCADO.getOrder(symbol, orderId);
        const order = req ? req.order : null;
        if (order) await PANSHI.updateMemory(symbol.replace('BRL', '').replace('FT', ''), monitorTypes.ORDER, {
            orderId: order.order_id,
            status: order.status,
            filled: order.has_fills,
            executedVol: parseFloat(order.executed_quantity),
            executedPrice: parseFloat(order.executed_price_avg),
            fee: parseFloat(order.fee)
        });
    }, interval);
}

function stopOrderMonitor(orderId) {
    clearInterval(orderPolls[orderId]);
    delete orderPolls[orderId];
}

async function startAgioMonitor() {
    if (!BINANCE || !MERCADO || !WSS) throw new Error('Exchanges not initialized yet!');
    MERCADO.getPrices(allSymbols, ticker => allSymbols.map((symbols, index) => pricesMBTC[symbols.currency] = ticker[index]));
    BINANCE.miniTickerStream((ticker) => {
        allSymbols.map((symbols, index) => {
            if (ticker[symbols.symbolBNC]) pricesBNC[symbols.currency] = ticker[symbols.symbolBNC]['close']
            agios[index] = ({ crypto: symbols.currency, agio: parseFloat((pricesMBTC[symbols.currency] / pricesBNC[symbols.currency] / dolar).toFixed(2)) });
        })
        WSS.broadcast({ agios });
    });
}

async function loadFirstData() {
    allSymbols = await symbolsRepository.getSymbols();
    const dolarReq = await getDolarPrice();
    dolar = dolarReq ? await settingsRepository.setDolarPrice(dolarReq) : await settingsRepository.getDolarPrice();

    try {
        MERCADO.getPrices(allSymbols, ticker => allSymbols.map((symbols, index) => pricesMBTC[symbols.currency] = ticker[index]), true);
        ((await BINANCE.lastPrice()).filter(o1 => allSymbols.some(o2 => o1.symbol === o2.symbolBNC))).map(symbol => pricesBNC[symbol.symbol.replace('USDT', '')] = symbol.price);
        WSS.broadcast({ agios });
    } catch (err) {
        if (err.code === 'ETIMEDOUT') loadFirstData();
        else console.log(err);
    };

    startAgioMonitor();
}

async function init(settings, wssInstance, panshiInstance) {
    if (!settings) throw new Error('Cant start without settings or panshi settings');
    const exchange = exchangeApi(settings);

    WSS = wssInstance;
    PANSHI = panshiInstance;
    BINANCE = exchange.Binance();
    MERCADO = exchange.MercadoBitcoin();

    loadFirstData();

    // const monitors = await monitorsRepository.getActiveMonitors();
    // for(let monitor of monitors) {
    //     switch (monitor.type) {
    //         case monitorTypes.AGIO:
    //             startAgioMonitor();
    //             break;

    //         case monitorTypes.BOOK:
    //             startBookMonitor();
    //             break;
    //         case monitorTypes.ORDER:
    //             await sleep(1000);
    //             startOrderMonitor();
    //             break;
    //     }
    // }

    const updateDolar = new CronJob('0 */5 8-17 * * 1-5', async () => {
        //A cada 5 minutos, de segunda a sexta das 9 as 18h (SP) atualiza a cotação do dolar
        console.log('Atualizando cotação do dolar...');
        const dolarReq = await getDolarPrice()
        dolar = dolarReq ? await settingsRepository.setDolarPrice(dolarReq) : await settingsRepository.getDolarPrice();
        PANSHI.updateMemory(null, 'dolar', dolar);
        WSS.broadcast({ dolar });
    }, null, true, 'America/Sao_Paulo');

    const saveProfit = new CronJob('00 00 00 * * *', () => {
        console.log('Meia noite atualiza o lucro do dia');
    }, null, null, 'America/Sao_Paulo');

    console.log('Running exchange monitor');
}

export default { init, startBookMonitor, startOrderMonitor, stopBookMonitor, stopOrderMonitor };