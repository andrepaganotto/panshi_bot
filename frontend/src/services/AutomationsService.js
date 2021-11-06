import baseApi from "./ApiService";
const api = baseApi();

async function getAutomations() {
    const resp = await api.get('/automations');
    return (resp.data);
}

async function getAutomation(id) {
    const resp = await api.get(`/automations/${id}`);
    return (resp.data);
}

async function insertAutomation(automation) {
    const resp = await api.post('/automations', automation);
    return (resp);
}

async function cancelAutomation(id) {
    const resp = await api.delete(`/automations/${id}`);
    return (resp);
}

export default { getAutomation, getAutomations, insertAutomation, cancelAutomation };