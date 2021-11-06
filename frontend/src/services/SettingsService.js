import baseApi from './ApiService';
const api = baseApi();

async function getSettings() {
    const resp = await api.get('/settings');
    return resp.data;
}

async function getBalance() {
    const resp = await api.get('/exchange/balance');
    return (resp.data);
}

async function getDolarPrice() {
    const resp = await api.get('/exchange/dolar');
    return (resp.data);
}


async function setSettings(newSettings) {
    const resp = await api.patch('/settings', newSettings);
    return resp.status;
}

export default { getSettings, setSettings, getBalance, getDolarPrice };