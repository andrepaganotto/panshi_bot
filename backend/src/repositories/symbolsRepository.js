import model from '../models/symbolModel.js'

function getSymbols() {
    return model.findAll();
}

function getSymbol(symbol) {
    return model.findByPk(symbol);
}

function syncSymbols(symbols) {
    return model.bulkCreate(symbols);
}

function deleteAll() {
    return model.destroy({ truncate: true });
}

export default { getSymbol, getSymbols, syncSymbols, deleteAll };