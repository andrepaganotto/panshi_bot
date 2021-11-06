import model from '../models/operationModel.js';

function getOperation(id) {
    return model.findByPk(id);
}

async function getOperations(opearationIds) {
    const op1 = await model.findByPk(opearationIds[0]);
    const op2 = await model.findByPk(opearationIds[1]);

    let first, second;
    if (op1.pos === 'FIRST') {
        first = await op1.get({ plain: true });
        if(op2) second = await op2.get({ plain: true });
    }
    else {
        first = await op2.get({ plain: true });
        second = await op1.get({ plain: true });
    }

    return { first, second };
}

function insertOperation(newOperation) {
    return model.create(newOperation);
}

async function updateOperation(id, newOperation, inactive) {
    const currentOperation = await getOperation(id);

    if (inactive) currentOperation.isActive = false;
    if (newOperation.filled && newOperation.filled !== currentOperation.filled) currentOperation.filled = newOperation.filled;
    if (newOperation.mons && newOperation.mons !== currentOperation.mons) currentOperation.mons = newOperation.mons;
    if (newOperation.status && newOperation.status !== currentOperation.status) currentOperation.status = newOperation.status;
    if (newOperation.orderId && newOperation.orderId !== currentOperation.orderId) currentOperation.orderId = newOperation.orderId;
    if (newOperation.priceMBTC && newOperation.priceMBTC !== currentOperation.priceMBTC) currentOperation.priceMBTC = newOperation.priceMBTC;
    if (newOperation.priceBNC && newOperation.priceBNC !== currentOperation.priceBNC) currentOperation.priceBNC = newOperation.priceBNC;
    if (newOperation.dolar && newOperation.dolar !== currentOperation.dolar) currentOperation.dolar = newOperation.dolar;
    if (newOperation.finishedAt && newOperation.finishedAt !== currentOperation.finishedAt) currentOperation.finishedAt = newOperation.finishedAt;
    if (newOperation.filledVol && newOperation.filledVol !== currentOperation.filledVol) currentOperation.filledVol = newOperation.filledVol;
    if (newOperation.buffedVol && newOperation.buffedVol !== currentOperation.buffedVol) currentOperation.buffedVol = newOperation.buffedVol;

    await currentOperation.save();
    return currentOperation.get({ plain: true });
}

export default { getOperation, getOperations, insertOperation, updateOperation };