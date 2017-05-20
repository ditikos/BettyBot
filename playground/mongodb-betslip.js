var {mongoose} = require('../server/db/mongoose');
var {Bet}      = require('../server/models/bet');

var _ = require('lodash');

Bet.find().then((docs) => {
    _.each(docs, (item) => {
        var value = eval(item.odds);
        var price = item.amount * value;
        var winnings = price + item.amount;
        console.log(`Bet Slip: ${item.betslip} with stake: ${item.amount} ${item.currency} and odds: ${item.odds} wins: ${winnings} ${item.currency}`);
    });
});

