import model from '../models/automationModel.js';
import { automationStatus } from '../utils/types.js';

//Retorna apenas uma automação (selecionada pelo ID)
function getAutomation(id) {
    return model.findByPk(id, { raw: true });
}

//Retorna todas as automações
function getAutomations() {
    return model.findAll({ raw: true });
}

//Retorna apenas as automações que estão rodando no momento
async function getActiveAutomations() {
    return model.findAll({ where: { status: automationStatus.RUNNING }, raw: true });
}

//Retorna uma automação com os métodos do sequelize, permitindo atualizar o objeto no banco
function getAutoForUpdate(id) {
    return model.findByPk(id);
}

//Insere uma nova automação no banco
function insertAutomation(newAutomation) {
    return model.create(newAutomation);
}

//Atualiza informações de uma automação
async function updateAutomation(id, newAutomation) {
    const currentAutomation = await getAutoForUpdate(id);

    if (newAutomation.order && newAutomation.order.price && newAutomation.order.id) currentAutomation.order = newAutomation.order;
    if (newAutomation.first && newAutomation.first.status) {
        currentAutomation.first.status = newAutomation.first.status;
        currentAutomation.changed('first', true);
    }
    if (newAutomation.second && newAutomation.second.status) {
        currentAutomation.second.status = newAutomation.second.status;
        currentAutomation.changed('second', true);
    }

    if (newAutomation.status && newAutomation.status !== currentAutomation.status) currentAutomation.status = newAutomation.status;
    if (newAutomation.finishedAt) currentAutomation.finishedAt = newAutomation.finishedAt;

    await currentAutomation.save();
    return currentAutomation.get({ plain: true });
}

//Acrescenta +1 ciclo completo na automação
async function incrementRun(id) {
    const automation = await getAutoForUpdate(id);
    automation.increment('runs');
    await automation.save();
    return (automation.runs);
}

//Apaga uma automação do banco
function deleteAutomation(id) {
    return model.destroy({ where: { id } });
}

export default { getAutomation, getAutomations, getActiveAutomations, insertAutomation, updateAutomation, deleteAutomation, incrementRun };