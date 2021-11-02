import { Sequelize } from 'sequelize';
import database from '../db.js';

const settingsModel = database.define('settings', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    keyMBTC: Sequelize.STRING,
    secretMBTC: Sequelize.STRING,
    nonceMBTC: Sequelize.INTEGER,
    keyBNC: Sequelize.STRING,
    secretBNC: Sequelize.STRING,
    dolar: Sequelize.FLOAT,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
}, {
    indexes: [{
        fields: ['email'],
        unique: true
    }]
})

export default settingsModel;