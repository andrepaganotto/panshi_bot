import model from '../models/operationModel.js';

function getOperation(id) {
    return model.findByPk(id);
}

async function getOperations(automationId) {
    const operations = model.findAll({ where: { automationId } });
    return operations;
}

function insertOperation(newOperation) {
    return model.create(newOperation);
}

export default { getOperation, getOperations, insertOperation };