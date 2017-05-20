var {mongoose} = require('./../server/db/mongoose');
var {Bet}      = require('./../server/models/bet');

var bet = new Bet({
    selection: "EV001SEL001",
    amount: 1,
    currency: "GBP",
    odds: '4/1',
    betslip: 'EV001_BET'
});

bet.save().then((doc) => {
    console.log(doc);
}, (e) => {
    console.log(e);
});

