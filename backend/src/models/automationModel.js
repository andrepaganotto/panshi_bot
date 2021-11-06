import { Sequelize } from 'sequelize';
import database from '../db.js';

const automationsModel = database.define('automation', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false
    },
    runs: {
        //Quantas vezes a automação ja completou um ciclo
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    loop: Sequelize.BOOLEAN, //Se ela se repete após terminar as operações ou não
    symbol: Sequelize.STRING, //Qual a crypto
    margin: Sequelize.BOOLEAN, //Se a execução de ordem na BNC vai ser margin ou não
    order: Sequelize.JSON, //Objeto que contém o preço e o ID da ordem posicionada no MBTC
    first: Sequelize.JSON, //Primeira operação para ser executada
    second: Sequelize.JSON, //Segunda operação para ser executada
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    finishedAt: Sequelize.DATE
});

export default automationsModel;