import axios from 'axios'
import qs from 'querystring';
import crypto from 'crypto';
import binanceApi from 'node-binance-api';
import settingsRepository from '../repositories/settingsRepository.js';

export async function avgPrice(book, type, volume) {
    return new Promise(resolve => {
        if (type == "SELL") {
            let avgPrice = 0; //Preço médio
            let leftToSell = parseFloat(volume); //Essa variavel é para guardar o quanto ainda falta VENDER
            for (let i = 0; leftToSell > 0; i++) {
                if (parseFloat(book.bids[i][1]) >= leftToSell) { //Se no nivel de preço tiver o suficiente para executar minha ordem ja fecha o loop
                    avgPrice += parseFloat(book.bids[i][0]) * leftToSell;
                    leftToSell = 0;
                }
                else {
                    leftToSell -= parseFloat(book.bids[i][1]); //Aqui eu subtraio o quanto eu ja VENDI para saber o quanto ainda falta no proximo loop
                    avgPrice += parseFloat(book.bids[i][0]) * parseFloat(book.bids[i][1]); //Aqui eu somo quanto eu VENDI * quanto paguei nesse nivel de preço
                }
                //console.log('Falta VENDER: '+leftToSell);
            }
            resolve(parseFloat(avgPrice / volume));
        }
        else if (type == "BUY") {
            let avgPrice = 0; //Preço médio
            let leftToBuy = parseFloat(volume); //Essa variavel é para guardar o quanto a gente ainda falta COMPRAR
            for (let i = 0; leftToBuy > 0; i++) {
                if (parseFloat(book.asks[i][1]) >= leftToBuy) { //Se no nivel de preço tiver o suficiente para executar minha ordem ja fecha o loop
                    avgPrice += parseFloat(book.asks[i][0]) * leftToBuy;
                    leftToBuy = 0;
                }
                else {
                    leftToBuy -= parseFloat(book.asks[i][1]); //Aqui eu subtraio o quanto eu ja COMPREI para saber o quanto ainda falta no proximo loop
                    avgPrice += parseFloat(book.asks[i][0]) * parseFloat(book.asks[i][1]); //Aqui eu somo quanto eu COMPREI * quanto paguei nesse nivel de preço
                }
                //console.log('Falta COMPRAR: '+leftToBuy);
            }
            resolve(parseFloat(avgPrice / volume));
        }
    })
}

export async function getDolarPrice() {
    try {
        const resp = await axios.get('https://api.hgbrasil.com/finance/quotations?key=705d2f19');
        // console.log(resp.data.results.currencies.USD);
        return parseFloat(resp.data.results.currencies.USD.buy);
    }
    catch (err) {
        console.error(err);
    }
}

export default function exchangeApi(settings) {
    if (!settings) throw new Error('Cant start without user settings');

    function MercadoBitcoin() {
        const config = {
            KEY: settings.keyMBTC,
            SECRET: settings.secretMBTC
        }

        const ENDPOINT_TRADE_PATH = "/tapi/v3/";
        const ENDPOINT_TRADE_API = "https://www.mercadobitcoin.net" + ENDPOINT_TRADE_PATH;
        const ENDPOIN_DATA_API = "https://www.mercadobitcoin.net/api";

        /*A função call faz a requisição para a API no MBTC, são passados como parametro apenas o metodo e os parametros, pois dentro da própria função
            ela já passa o "nonce" que é requisitado pela API, ja passa também o ID e o SECRET do usuário*/
        async function callApi(method, parameters) {
            /*Aqui a requisição é feita com o método POST como solicitado pela documentação da API, passando o endpoint (o url para quem vai ser feita a requisição),
            a query string com o método, o nonce e os parametros. E por ultimo os dados do cabeçalho referente a quem está realizando a solicitação*/
            const retries = 3;
            for (let i = 0; i < retries; i++) {
                try {
                    const nonce = await settingsRepository.incrementNonce(settings.id);
                    console.log('Req:', nonce);

                    let queryString = qs.stringify({ tapi_method: method, tapi_nonce: nonce }); //A query string sempre vai por padrão com o metodo e o nonce
                    if (parameters) queryString += `&${qs.stringify(parameters)}`; //Se tiver parametros no metodo requisitado ele é inserido na qs aqui

                    //A API do MBTC exige que o SECRET do usuário seja enviado em formato criptografado HMAC (key-hash mac)
                    const signature = crypto.createHmac('sha512', config.SECRET)
                        .update(`${ENDPOINT_TRADE_PATH}?${queryString}`)
                        .digest('hex');

                    const response = await axios.post(ENDPOINT_TRADE_API, queryString, { headers: { 'TAPI-ID': config.KEY, 'TAPI-MAC': signature } });
                    if (response.data.response_data) return response.data.response_data;
                    else {
                        const err = response.data;
                        console.log(err);

                        if (err.status_code === 207) //Sem saldo em reais
                            return false;
                        if (err.status_code === 212) //Ordem ja processada ou cancelada
                            return false;
                        if (err.status_code === 246) //Sem saldo de token
                            return false;
                    }
                }
                catch (err) {
                    console.log(err.message);
                }

            }
        }

        /* ---------------------- PUBLIC CALLS ---------------------- */

        async function lastPrice(symbol) {
            const currency = symbol.replace('BRL', '');
            const response = await axios.get(`${ENDPOIN_DATA_API}/${currency}/ticker`);
            return response.data.ticker.last;
        }

        async function getPrices(symbols, callback, first) {
            if (first) {
                const prices = await Promise.all(symbols.map(async symbol => await lastPrice(symbol.symbolMBTC)));
                callback(prices);
            }
            else {
                const getPricesMBTC = setInterval(async () => {
                    try {
                        const prices = await Promise.all(symbols.map(async symbol => await lastPrice(symbol.symbolMBTC)));
                        callback(prices);
                    } catch (err) { if (err.code !== 'ETIMEDOUT') console.error(err.message) };
                }, 15000);
            }
        }

        /* ---------------------- PRIVATE CALLS ---------------------- */

        //Retorna as ultimas atualizações do servidor, mensagens importantes da API etc...
        function updateNotes() {
            return callApi('list_system_messages');
        }

        //Retorna informações sobre a conta, como saldo, ordens abertas, limites etc...
        function getAccountInfo() {
            return callApi('get_account_info');
        }

        //Retorna informações sobre a ordem especificada através do ID
        function getOrder(symbol, id) {
            return callApi('get_order', {
                'coin_pair': `${symbol}`,
                'order_id': id
            });
        }

        //Retorna uma lista com as ordens filtradas de acordo com os parametros especificados
        function listOrders(symbol, type, status) {
            if (type) type = type == 'BUY' ? 1 : 2;
            status = status == 'PENDING' ? '[1]' : status == 'OPEN' ? '[2]' : status == 'CANCELLED' ? '[3]' : status == 'FILLED' ? '[4]' : '[1,2,3,4]';

            return callApi('list_orders', {
                'coin_pair': `${symbol}`,
                'order_type': type,
                'status_list': `${status}`
            });
        }

        //Retorna o book de ofertas das 20 ultimas ofertas tanto bid como ask em formato de objeto
        function listOrderbook(symbol, full = false) {
            return callApi('list_orderbook', {
                'coin_pair': `${symbol}`,
                full
            });
        }

        //Posiciona ordem de COMPRA no book de ofertas
        function buy(symbol, volume, price) {
            return callApi('place_buy_order', {
                'coin_pair': `${symbol}`,
                'quantity': `${volume}`,
                'limit_price': `${price}`,
            });
        }

        //Executa ordem de COMPRA à mercado de acordo com o volume em REAIS especificado
        function marketBuy(symbol, volume) {
            console.log(symbol, volume);
            return callApi('place_market_buy_order', {
                'coin_pair': `${symbol}`,
                'cost': `${volume}`
            });
        }

        //Posiciona ordem de VENDA no book de ofertas
        function sell(symbol, volume, price) {
            return callApi('place_sell_order', {
                'coin_pair': `${symbol}`,
                'quantity': `${volume}`,
                'limit_price': `${price}`,
            });
        }

        //Executa ordem de VENDA à mercado de acordo com o volume em CRYPTO especificado
        function marketSell(symbol, volume) {
            return callApi('place_market_sell_order', {
                'coin_pair': `${symbol}`,
                'quantity': `${volume}`
            });
        }

        //Cancela a ordem do ID especificado
        function cancelOrder(symbol, id) {
            return callApi('cancel_order', {
                'coin_pair': `${symbol}`,
                'order_id': id
            })
        }

        return { updateNotes, getAccountInfo, getOrder, listOrders, listOrderbook, buy, marketBuy, sell, marketSell, cancelOrder, lastPrice, getPrices };
    }

    function Binance() {
        const config = {
            KEY: settings.keyBNC,
            SECRET: settings.secretBNC,
            API: 'https://api.binance.com'
        };

        /*     ---------- GENERIC METHODS ----------     */

        //Função para requisições sem autenticação de segurança
        async function publicCall(path, data, method = "GET") {
            try {
                const queryString = data ? `?${qs.stringify(data)}` : "";
                const response = await axios({
                    method,
                    url: `${config.API}${path}${queryString}`
                });
                return response.data;
            }
            catch (err) {
                console.error(err)
            }
        }

        //Função para requisições que necessitam de private key and secret
        async function privateCall(path, data = {}, method = 'GET') {
            const timestamp = Date.now(); //Gerador de nonce
            const signature = crypto.createHmac('sha256', config.SECRET)
                .update(`${qs.stringify({ ...data, timestamp })}`)
                .digest('hex');

            const newData = { ...data, timestamp, signature };
            const queryString = `?${qs.stringify(newData)}`;

            try {
                const response = await axios({
                    method,
                    url: `${config.API}${path}${queryString}`,
                    headers: { 'X-MBX-APIKEY': config.KEY }
                });
                return response.data;
            }
            catch (err) {
                console.error(err)
            }
        }

        function orderControll(options = { margin: false, cancel: false, getList: false, getStatus: false, id: null }, symbol, side, type, volume, price) {
            const path = options.margin ? '/sapi/v1/margin/order' : options.getList ? '/api/v3/openOrders' : '/api/v3/order';
            const data = options.getList ? { symbol } : (options.cancel || options.getStatus) ? { symbol, orderId: options.id } : { symbol, side, type, quantity: volume };
            const method = options.cancel ? 'DELETE' : (options.getList || options.getStatus) ? 'GET' : 'POST';

            if (type === 'LIMIT') {
                data.timeInForce = 'GTC';
                data.price = price;
            }

            return privateCall(path, data, method);
        }

        /*     ---------- PUBLIC CALLS ----------     */

        function lastPrice(symbol) {
            if (symbol)
                return publicCall('/api/v3/ticker/price', { symbol: `${symbol}` });
            else
                return publicCall('/api/v3/ticker/price');
        }

        function orderBook(symbol, limit = 20) {
            return publicCall('/api/v3/depth', { symbol: `${symbol}`, limit: `${limit}` });
        }

        /*     ---------- PRIVATE CALLS ----------     */

        function getAccountInfo() {
            return privateCall('/api/v3/account')
        }

        function getAllCoinsInfo() {
            return privateCall('/sapi/v1/capital/config/getall');
        }

        const buy = {
            spot: (symbol, volume, price) => { return orderControll({}, `${symbol}`, 'BUY', 'LIMIT', volume, price) },
            margin: (symbol, volume, price) => { return orderControll({ margin: true }, `${symbol}`, 'BUY', 'LIMIT', volume, price) }
        }

        const marketBuy = {
            spot: (symbol, volume) => { return orderControll({}, `${symbol}`, 'BUY', 'MARKET', volume) },
            margin: (symbol, volume) => { return orderControll({ margin: true }, `${symbol}`, 'BUY', 'MARKET', volume) }
        }

        const sell = {
            spot: (symbol, volume, price) => { return orderControll({}, `${symbol}`, 'SELL', 'LIMIT', volume, price) },
            margin: (symbol, volume, price) => { return orderControll({ margin: true }, `${symbol}`, 'SELL', 'LIMIT', volume, price) }
        }

        const marketSell = {
            spot: (symbol, volume) => { return orderControll({}, `${symbol}`, 'SELL', 'MARKET', volume) },
            margin: (symbol, volume) => { return orderControll({ margin: true }, `${symbol}`, 'SELL', 'MARKET', volume) }
        }

        const listOpenOrders = {
            spot: (symbol) => { return orderHandler({ getList: true }, `${symbol}`) },
            margin: (symbol) => { return orderHandler({ margin: true, getList: true }, `${symbol}`); }
        }

        const getOrderStatus = {
            spot: (symbol, id) => { return orderHandler({ getStatus: true, orderId: id }, `${symbol}`) },
            margin: (symbol, id) => { return orderHandler({ margin: true, getStatus: true, orderId: id }, `${symbol}`) }
        }

        const cancelOrder = {
            spot: (symbol, id) => { return orderHandler({ cancel: true, orderId: id }, `${symbol}`) },
            margin: (symbol, id) => { return orderHandler({ margin: true, cancel: true, orderId: id }, `${symbol}`) }
        }

        const margin = {
            borrow: (symbol, volume) => {
                return privateCall('/sapi/v1/margin/loan', {
                    symbol: symbol.replace('USDT', ''),
                    amount: volume
                }, 'POST')
            },

            repay: (symbol, volume) => {
                return privateCall('/sapi/v1/margin/repay', {
                    symbol: symbol.replace('USDT', ''),
                    amount: volume
                }, 'POST')
            },

            getDebt: async (symbol) => {
                const coins = (await privateCall('/sapi/v1/margin/account')).userAssets;
                const coin = coins.find(c => c.asset === symbol.replace('USDT', ''));
                return parseFloat((parseFloat(coin.borrowed) + parseFloat(coin.interest)).toFixed(8));
            },

            getAccountInfo: async () => {
                return privateCall('/sapi/v1/margin/account')
            }
        }

        /*     ---------- NODE BINANCE API ----------     */

        const stream = binanceApi({
            APIKEY: config.KEY,
            APISECRET: config.SECRET
        })

        function exchangeInfo() {
            return stream.exchangeInfo();
        }

        function miniTickerStream(callback) {
            stream.websockets.miniTicker(markets => callback(markets))
        }

        function userDataStream(balanceCallback, executionCallback, listStatusCallback) {
            stream.websockets.userData(
                balance => balanceCallback(balance),
                executionData => executionCallback(executionData),
                subscribedData => console.log(`userDatStream:subscribed: ${subscribedData}`),
                listStatusData => listStatusCallback(listStatusData)
            );
        }

        const endpoints = {};
        function bookDepthStream(symbol, callback) {
            if (endpoints[symbol]) return;
            endpoints[symbol] = stream.websockets.depth([symbol], depth => callback(depth));
        }

        function terminateBookDepthStream(symbol) {
            stream.websockets.terminate(endpoints[symbol]);
            delete endpoints[symbol];
        }

        return {
            buy, marketBuy, sell, marketSell, listOpenOrders, getOrderStatus, getAllCoinsInfo, cancelOrder, lastPrice, orderBook, getAccountInfo, margin,
            exchangeInfo, miniTickerStream, userDataStream, bookDepthStream, terminateBookDepthStream
        };
    }

    return { Binance, MercadoBitcoin };
}