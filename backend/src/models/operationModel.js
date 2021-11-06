import { Sequelize } from 'sequelize';
import database from '../db.js';

const operationsModel = database.define('operations', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    automationId: {
        //Automação a qual essa operação pertence
        type: Sequelize.INTEGER,
        allowNull: false
    },
    run: Sequelize.INTEGER, //Em qual ciclo da automação mãe essa operação foi executada
    side: Sequelize.STRING, //Compra ou venda
    liquidVol: Sequelize.DECIMAL(10, 8), //Volume líquido executado no MBTC
    priceMBTC: Sequelize.DECIMAL(10, 8), //Preço em que a ordem foi executada no MBTC
    priceBNC: Sequelize.DECIMAL(10, 8), //Preço em que a ordem foi executada a mercado na BNC
    dolar: Sequelize.DECIMAL(10, 5), //Valor que estava o dólar no momento da execução
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    finishedAt: Sequelize.DATE
});

export default operationsModel;