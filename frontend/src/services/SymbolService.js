import baseApi from './ApiService.js';
const api = baseApi();

async function getSymbols() {
    const resp = await api.get('/symbols');
    return (resp.data);
}

async function getSymbol(symbol) {
    const resp = await api.get(`/symbols/${symbol}`);
    return (resp.data);
}

async function syncSymbols() {
    const resp = await api.post('/symbols/sync');
    return (resp.data);
}

export default { getSymbols, getSymbol, syncSymbols };