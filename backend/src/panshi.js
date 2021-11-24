import exchangeApi, { getDolarPrice, avgPrice } from './utils/exchange.js';
import { monitorTypes, automationStatus, operationStatus } from './utils/types.js';

import exchangeMonitor, { startMonitors, stopMonitors, sleep } from './app-em.js';

import symbolsRepository from './repositories/symbolsRepository.js';
import automationsRepository from './repositories/automationsRepository.js';
import operationsRepository from './repositories/operationsRepository.js';
import chalk from 'chalk';


let BINANCE, MERCADO;
const MEMORY = { dolar: null }, LOGS = false;
let BRAIN = {}, BRAIN_INDEX = {};

let LOCK_MEMORY = false, LOCK_BRAIN = false, WSS;

async function init(settings, automations, websocket) {
    try {
        const exchange = exchangeApi(settings);
        BINANCE = exchange.Binance();
        MERCADO = exchange.MercadoBitcoin();

        MEMORY.dolar = await getDolarPrice();

        LOCK_BRAIN = true;
        LOCK_MEMORY = true;

        WSS = websocket;
        BRAIN = {};
        BRAIN_INDEX = {};
        if (automations) {
            for (let auto of automations) {
                await sleep(1000);
                updateBrain(auto);
            }
        }
    }
    finally {
        LOCK_BRAIN = false;
        LOCK_MEMORY = false;
    }
}

/* ---------------------- BEGIN BRAIN ---------------------- */

//Analisa os dados que chegam dos monitores e toma as decisões
async function evalDecision(automation, memoryData, type) {
    const { first, second } = automation;

    if (type === monitorTypes.ORDER && automation.order.id === memoryData.orderId) {
        switch (memoryData.status) {
            case 4:
                //Finaliza a operação que está rodando da correspondente automação
                await finishOperation(automation, memoryData);

                //Se for a primeira e não tiver loop finaliza a automação => OK
                if (!second && !automation.loop) await finishAutomation(automation);

                //Se for a primeira e tiver loop reinicia a automação => OK
                else if (!second && automation.loop) await startAutomation(automation, true);

                //Executa a segunda operação se a que estiver rodando no momento for a primeira => OK
                else if (second.status === operationStatus.QUEUE) await startOperation({ ...second, symbol: automation.symbol });

                //Se for a segunda e não tiver loop finaliza a automação => OK
                else if (second.status === operationStatus.FINISHED && !automation.loop) await finishAutomation(automation);

                //Se for a segunda e tiver loop reinicia a automação => OK
                else if (second.status === operationStatus.FINISHED && automation.loop) await startAutomation(automation, true);
                break;
            case 3:

                break;
            case 2:

                break;
        }

    } else if (type === monitorTypes.BOOK) {
        // console.log('evalDecision => Recebendo atualização do tipo BOOK para o symbol', automation.symbol);

    }
}

function updateBrainIndex(index, automationId) {
    if (!BRAIN_INDEX[index]) BRAIN_INDEX[index] = [];
    BRAIN_INDEX[index].indexOf(automationId) === -1 && BRAIN_INDEX[index].push(automationId);
}

function deleteBrainIndex(index, automationId) {
    if (!BRAIN_INDEX[index] || BRAIN_INDEX[index].lenght === 0) return;
    const pos = BRAIN_INDEX[index].findIndex(id => id === automationId);
    BRAIN_INDEX[index].splice(pos, 1);
}

function updateBrain(automation) {
    // console.log('Updating brain with automation:', automation);
    if (automation.status !== automationStatus.RUNNING) return;
    updateBrainIndex(automation.symbol, automation.id);
    BRAIN[automation.id] = automation;
    startMonitors(automation.symbol, automation.order.id);
}

function deleteBrain(automation) {
    try {
        LOCK_BRAIN = true;
        delete BRAIN[automation.id]
        deleteBrainIndex(automation.symbol, automation.id);
    }
    finally {
        LOCK_BRAIN = false;
    }
}

export function getBrain() {
    return { ...BRAIN, INDEXES: BRAIN_INDEX };
}

/* ---------------------- END BRAIN ---------------------- */



/* ---------------------- BEGIN MEMORY  ---------------------- */

function findAutomation(symbol) {
    const ids = BRAIN_INDEX[symbol];
    if (!ids) return false;
    return ids.map(id => BRAIN[id]);
}

async function updateMemory(symbol, type, value) {
    if (LOCK_MEMORY || LOCK_BRAIN) return false;

    const memoryKey = type === 'ORDER' ? `${symbol}:${type}:${value.orderId}` : type === 'dolar' ? 'dolar' : `${symbol}:${type}`;
    MEMORY[memoryKey] = value;

    LOGS && console.log(`Panshi ${chalk.bgRgb(255, 159, 26).dim('memory update')}: ${type} => ${JSON.stringify(value)}`);

    try {
        const automations = findAutomation(symbol);
        if (automations && automations.length && !LOCK_BRAIN) {
            LOCK_BRAIN = true;
            LOCK_MEMORY = true;
            await Promise.all(automations.map(async auto => await evalDecision(auto, MEMORY[memoryKey], type)));
        }
    } finally {
        LOCK_BRAIN = false;
        LOCK_MEMORY = false;
    }
}

function deleteMemory(automation) {
    try {
        LOCK_MEMORY = true;

        //Apago a memória de ordem da automação e paro o seu monitor
        exchangeMonitor.stopOrderMonitor(automation.order.id);
        delete MEMORY[`${automation.symbol}:ORDER:${automation.order.id}`];

        //Se não tiver mais nem uma automação que está usando o mesmo symbol apago também a memória de book e paro o monitor
        if (!(findAutomation(automation.symbol)).length) {
            exchangeMonitor.stopBookMonitor(automation.symbol);
            delete MEMORY[`${automation.symbol}:BOOK`];
        }
    }
    finally { LOCK_MEMORY = false }
}

export function getMemory() {
    return { ...MEMORY };
}

/* ---------------------- END MEMORY  ---------------------- */



/* ---------------------- BEGIN OPERATIONS  ---------------------- */

//Faz os cálculos para abrir a ordem no MBTC, tenta abri-la e caso obtenha sucesso inicia os monitores para aquela ordem
async function startOperation(operation) {
    const { symbolMBTC, symbolBNC } = await symbolsRepository.getSymbol(operation.symbol); //Pega a versão BNC e MBTC do symbol da operação
    const avgPriceBNC = await avgPrice(await BINANCE.orderBook(symbolBNC), operation.side === 'BUY' ? 'SELL' : 'BUY', operation.vol); //Calcula o preço médio de execução ba Binance
    const limitPriceMBTC = parseFloat((avgPriceBNC * MEMORY.dolar * operation.agio).toFixed(5)); //Calcula o preço que a ordem deve ser colocada no MBTC

    //Tenta abrir a limit order de compra ou venda no MBTC
    console.log(`${chalk.rgb(24, 220, 255).bold('startOperation =>')} Abrindo ordem no MBTC`);
    let openOrder = operation.side === 'BUY' ?
        await MERCADO.buy(symbolMBTC, operation.vol, limitPriceMBTC) :
        await MERCADO.sell(symbolMBTC, operation.vol, limitPriceMBTC);

    if (!openOrder.order || openOrder.order.status === 1) { //Caso não consiga abrir a ordem no MBTC retorna falso
        await MERCADO.cancelOrder(symbolMBTC, openOrder.order.order_id);
        return false;
    } else {
        //Retorna informações para a automação
        return {
            id: openOrder.order.order_id,
            price: parseFloat(openOrder.order.limit_price)
        };
    }
}

//Muda o preço de uma ordem no MBTC de acordo com a variação da BNC
async function changeOperation(operation, limitPriceMBTC) {

}

//Após comprar ou vender no MBTC, executa a mercado a operação na posição contrária na BNC e salva a operação realizada no banco de estatistica
async function finishOperation(automation, order) {
    const avgExecutedPrice = (fills, precision) => {
        let totalVol = 0;
        let price = 0;
        for (let fill of fills) {
            totalVol += parseFloat(fill.qty);
            price += parseFloat(fill.price) * parseFloat(fill.qty);
        }
        return parseFloat((price / totalVol).toFixed(precision));
    }

    const operation = automation.second && automation.first.status === operationStatus.FINISHED ? automation.second : automation.first; //Pego a operação que está rodando na automação
    console.log(`${chalk.rgb(24, 220, 255).bold('finishOperation => ')} ${operation.side === 'BUY' ? chalk.rgb(50, 255, 126).bold('Comprei') : chalk.rgb(255, 77, 77).bold('Vendi')} no MBTC, ${operation.side === 'BUY' ? chalk.rgb(255, 77, 77).bold('vendendo') : chalk.rgb(50, 255, 126).bold('comprando')} na BNC!`);
    operation.status = operationStatus.FINISHED; //Defino o status da operação como finalizado

    const { symbolBNC, precisionBNC } = await symbolsRepository.getSymbol(automation.symbol);
    const liquidVol = operation.side === 'BUY' ? (order.executedVol - order.fee).toFixed(precisionBNC) : order.executedVol.toFixed(precisionBNC); //Calcula o volume liquido a ser executado a mercado na BNC
    const orderBNC = operation.side === 'BUY' ? await BINANCE.marketSell.spot(symbolBNC, liquidVol) : await BINANCE.marketBuy.spot(symbolBNC, liquidVol); //Executa a operação a mercado na BNC
    const priceBNC = avgExecutedPrice(orderBNC.fills, precisionBNC); //Calcula o preço médio em que a ordem a mercado foi executada na BNC

    //Após finalizar uma operação pertencente a uma automação salvo ela no banco apenas com dados estatísticos
    return await operationsRepository.insertOperation({
        automationId: automation.id,
        run: automation.runs + 1,
        side: operation.side,
        priceMBTC: order.executedPrice,
        dolar: MEMORY.dolar,
        executedAgio: parseFloat(order.executedPrice / priceBNC / MEMORY.dolar),
        liquidVol, priceBNC
    })
}

/* ---------------------- END OPERATIONS  ---------------------- */



/* ---------------------- BEGIN AUTOMATIONS  ---------------------- */

//Inicia ou reinicia uma automação, dando inicio a primeira operação e salvando a mesma no banco
async function startAutomation(automation, restarting) {
    const { first, second } = automation;

    const started = await startOperation({ ...first, symbol: automation.symbol }); //Tento abrir a primeira operação
    if (started) { //Se obtiver sucesso
        automation.status = automationStatus.RUNNING; //Atribuo o status de RUNNING para a first
        automation.first.status = operationStatus.RUNNING; //e para a automação em si
        if (second) automation.second.status = operationStatus.QUEUE; //e QUEUE para second se tiver

        if (restarting) { //Se estiver reiniciando a automação
            exchangeMonitor.stopOrderMonitor(automation.order.id); //Paro o monitor de ordens dessa automação

            automation.order = started; //Atribuo os valores que vieram de ID e Price
            await automationsRepository.incrementRun(automation.id); //Incremento uma run
            automation.runs = (await automationsRepository.updateAutomation(automation.id, automation)).runs; //Atualizo a automação no banco

            exchangeMonitor.startOrderMonitor((await symbolsRepository.getSymbol(automation.symbol)).symbolMBTC, automation.order.id); //Reinicio o monitor de ordens para a automação
            console.log(`${chalk.rgb(24, 220, 255).bold('startAutomation =>')} ${automation.runs}ª execução da automação (${automation.id}) FINALIZADA com sucesso! Recomeçando...`);
        }
        else { //Se estiver CRIANDO a automação, salvo no banco a automação criada e retorno ela para o controller, após isso atualizo o cérebro com a automação criada            
            automation.order = started; //Atribuo os valores que vieram de ID e Price
            automation = await (await automationsRepository.insertAutomation(automation)).get({ plain: true });
            updateBrain(automation);
            console.log(`${chalk.rgb(24, 220, 255).bold('startAutomation =>')} Automação (${automation.id}) INICIADA com sucesso!`);
            return automation;
        }
    } else return false;
}

//Finaliza ou cancela uma automação
async function finishAutomation(automation, cancel) {
    deleteBrain(automation);
    deleteMemory(automation);

    if (cancel) { //Caso precise CANCELAR a automação
        console.log(`${chalk.rgb(24, 220, 255).bold('finishAutomation =>')} Cancelando ordem no MBTC`);
        await MERCADO.cancelOrder((await symbolsRepository.getSymbol(automation.symbol)).symbolMBTC, automation.order.id); //Tenta cancelar a ordem no MBTC

        //Se a automação não tiver nenhuma RUN e a primeira operação ainda não foi executada pode apagar do banco
        if (automation.runs === 0 && automation.first.status != operationStatus.FINISHED) {
            console.log(`${chalk.rgb(24, 220, 255).bold('finishAutomation =>')} Automação ${automation.id} CANCELADA com sucesso`);
            return await automationsRepository.deleteAutomation(automation.id);
        }
        //Se a automação tiver rodado alguma vez ou se a primeira tiver sido finalizada, apenas atualizo no banco o status dela
        else if (automation.runs >= 1 || automation.first.status === operationStatus.FINISHED) {
            automation.status = automationStatus.CANCELED;
            console.log(`${chalk.rgb(24, 220, 255).bold('finishAutomation =>')} Automação ${automation.id} CANCELADA com sucesso`);
            return await automationsRepository.updateAutomation(automation.id, automation);
        }
    }

    await automationsRepository.incrementRun(automation.id); //Soma uma run
    automation.status = automationStatus.FINISHED; //Defino o status como finalizado
    automation.finishedAt = new Date(); //Defino a data e hora da finalização
    console.log(`${chalk.rgb(24, 220, 255).bold('finishAutomation =>')} Automação ${automation.id} FINALIZADA com sucesso`);

    return await automationsRepository.updateAutomation(automation.id, automation); //Salvo no banco
}

/* ---------------------- END AUTOMATIONS  ---------------------- */

export default { init, updateMemory, getMemory, getBrain, startAutomation, finishAutomation };