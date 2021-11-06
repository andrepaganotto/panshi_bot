import { monitorTypes, automationStatus, operationStatus } from './utils/types.js';
import automationsRepository from './repositories/automationsRepository.js';

const MEMORY = {}, LOGS = false;
let BRAIN = { a: 1 }, BRAIN_INDEX = { b: 2 };

let LOCK_MEMORY = false, LOCK_BRAIN = false, WSS;

function init(automations, websocket) {
    try {
        LOCK_BRAIN = true;
        LOCK_MEMORY = true;

        WSS = websocket;
        BRAIN = {};
        BRAIN_INDEX = {}
        automations && automations.map(auto => updateBrain(auto));
    }
    finally {
        LOCK_BRAIN = false;
        LOCK_MEMORY = false;
    }
}

/* ---------------------- BEGIN BRAIN ---------------------- */

//Analisa os dados que chegam dos monitores e toma as decisões usando as funçoes handler
async function evalDecision() {

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
    console.log('Updating brain with automation:', automation);
    if (automation.status !== automationStatus.RUNNING) return;
    updateBrainIndex(automation.symbol, automation.id);
    BRAIN[automation.id] = automation;
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
    if (LOCK_MEMORY) return false;

    const memoryKey = type === 'ORDER' ? `${symbol}:${type}:${value.orderId}` : type === 'dolar' ? 'dolar' : `${symbol}:${type}`;
    MEMORY[memoryKey] = value;

    LOGS && console.log(`Panshi memory update: ${symbol} => ${JSON.stringify(value)}`);

    if (LOCK_BRAIN) return false;
    try {
        const automations = findAutomation(symbol);
        if (automations && automations.length && !LOCK_BRAIN) {
            LOCK_BRAIN = true;

            await Promise.all(automations.map(async auto => await evalDecision(auto, memoryKey, type)));
        }
    }
    finally {
        LOCK_BRAIN = false;
    }
}

function deleteMemory(symbol, orderId) {
    try {
        LOCK_MEMORY = true;

        delete MEMORY[`${symbol}:ORDER:${orderId}`];

        if (!(findAutomation(symbol)).length) {
            delete MEMORY[`${symbol}:BOOK`];
        }
    }
    finally { LOCK_MEMORY = false }
}

export function getMemory() {
    return { ...MEMORY };
}

/* ---------------------- END MEMORY  ---------------------- */



/* ---------------------- BEGIN OPERATIONS  ---------------------- */

//Faz os cálculos para abrir a ordem no MBTC, tenta abri-la e caso obtenha sucesso inicia os monitores para aquela ordem e salva no banco a operação
async function startOperation(operation, queue) {

}

//Muda o preço de uma ordem no MBTC de acordo com a variação da BNC
async function changeOperation(operation, limitPriceMBTC) {

}

// Após comprar ou vender no MBTC, executa a mercado a operação na posição contrária na BNC e salva a operação realizada no banco de estatistica
async function finishOperation(operation, order) {
    const avgExecutedPrice = (fills, precision) => {
        let totalVol = 0;
        let price = 0;
        for (let fill of fills) {
            totalVol += parseFloat(fill.qty);
            price += parseFloat(fill.price) * parseFloat(fill.qty);
        }
        return parseFloat((price / totalVol).toFixed(precision));
    }

    /*
        SALVAR NO BANCO:
        Após finalizar uma operação pertencente a uma automação salvo ela no banco apenas com dados estatísticos
        Operation: {
            id: ,
            automationId: ,
            run: ,
            side: ,
            liquidVol: ,
            priceMBTC: ,
            priceBNC: ,
            dolar: ,
            executedAgio: 
        }
    */
}

/* ---------------------- END OPERATIONS  ---------------------- */



/* ---------------------- BEGIN AUTOMATIONS  ---------------------- */

//Da início a primiera operação e caso obtenha sucesso prepara a segunda e salva a automação no banco
async function startAutomation(newAutomation) {

}

//Recomeça uma automação que tem loop
async function restartAutomation(automation, newOperations) {

}

//Finaliza uma automação
async function finishAutomation(automation) {

}

//Cancela uma automação, cancelando ordens abertas e parando monitores
async function cancelAutomation(automation, cancelOrder) {

}

/* ---------------------- BEGIN OPERATIONS  ---------------------- */

export default { init, updateBrain, getBrain, updateMemory, getMemory, startAutomation, cancelAutomation };