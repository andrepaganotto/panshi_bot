import repository from '../repositories/automationsRepository.js';
import { automationStatus } from '../utils/types.js';
import panshi, { getMemory, getBrain } from '../panshi.js';

async function getAutomation(req, res, next) {
    const automation = await repository.getAutomation(req.params.id);
    if (!automation) return res.status(204).end();
    return res.json(automation);
}

async function getAutomations(req, res, next) {
    const automations = await repository.getAutomations();
    if (!automations) return res.status(204).end();
    return res.json(automations);
}

async function getActiveAutomations(req, res, next) {
    const automations = await repository.getActiveAutomations();
    if (!automations) return res.status(204).end();
    return res.json(automations);
}

async function insertAutomation(req, res, next) {
    const newAutomation = req.body;
    const automation = await panshi.startAutomation(newAutomation)
    if (!automation) return res.status(503).end();
    return res.status(201).end();
}

async function cancelAutomation(req, res, next) {
    const id = req.params.id;
    const automation = await repository.getAutomation(id);
    if (!automation || automation.status === automationStatus.CANCELED) return res.status(208).send('Operação já cancelada').end();

    const canceled = await panshi.finishAutomation(automation, true);
    if (!canceled) return res.status(208).send('Operação já executada ou cancelada, aguarde processamento!').end();
    return res.status(204).end();
}

function getPanshiBrain(req, res) {
    const brain = getBrain();
    return res.json(brain);
}

function getPanshiMemory(req, res) {
    const memory = getMemory();
    return res.json(memory);
}

export default { getAutomations, getActiveAutomations, getAutomation, insertAutomation, cancelAutomation, getPanshiBrain, getPanshiMemory };