var mongoose = require('mongoose');

var BetSchema = mongoose.Schema({
    selection: {
        type: String
    },
    amount: {
        type: Number
    },
    currency: {
        type: String
    },
    odds: {
        type: String
    },
    betslip: {
        type: String
    }
});

var Bet = mongoose.model('Bet', BetSchema, 'Bets');

module.exports = { Bet };