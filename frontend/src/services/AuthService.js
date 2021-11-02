import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

const isAuthenticated = () => localStorage.getItem('token') !== null;

function isValidToken() {
    const token = localStorage.getItem('token');
    return new Promise(async (resolve, reject) => {
        try {
            const resp = await axios.post(`${API_URL}/logged`, {}, { headers: { 'authorization': token } });
            if (resp.status === 200) resolve(true);
        }
        catch (error) {
            console.log(error);
        }
    })
}

function login(email, password) {
    return new Promise(async (resolve, reject) => {
        try {
            const resp = await axios.post(`${API_URL}/login`, { email, password })
            if (resp.status === 200) {
                localStorage.setItem('token', resp.data.token);
                resolve(true);
            }
        }
        catch (error) {
            console.log(error);
            reject('Usuário e/ou senha inválido(s)');
        }
    })
}

async function logout() {
    const token = localStorage.getItem('token');
    await axios.post(`${API_URL}/logout`, {}, { headers: { 'authorization': token } });
    localStorage.removeItem('token');
}

export default { login, logout, isAuthenticated, isValidToken };