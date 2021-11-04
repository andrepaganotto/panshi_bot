import { Sequelize } from 'sequelize';
import database from '../db.js';

const symbolModel = database.define('symbol', {
    currency: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    symbolMBTC: {
        type: Sequelize.STRING,
        allowNull: false
    },
    symbolBNC: {
        type: Sequelize.STRING,
        allowNull: false
    },
    precisionMBTC: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
        allowNull: false
    },
    precisionBNC: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    minBNC: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
        allowNull: false
    },
    margin: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
})

export default symbolModel;