var {mongoose} = require('./../server/db/mongoose');
var {Bet}      = require('./../server/models/bet');
var {Event}      = require('./../server/models/event');
var _ = require('lodash');

var value = 'EV006SEL003';
Event.find({} , {selection: { $elemMatch: {select_id: value}}}).then((doc) => {
    var odds = "";
    _.each(doc, (item) => {
        _.each(item.selection, (item2) => {
            odds = item2.odds;
            return false;
        });
    });
    console.log(odds);
    var bet = new Bet({
        selection: "EV006SEL003",
        amount: 1,
        currency: "GBP",
        odds: odds,
        betslip: 'EV001SEL001_12345'
    });
    bet.save().then((doc) => {
        console.log(doc);
    }, (e) => {
        console.log(e);
    });
});


/*
bet.save().then((doc) => {
    console.log(doc);
}, (e) => {
    console.log(e);
});
*/

/*
            var bet = new Bet({
                selection: selection,
                amount: amount,
                currency: currency,
                betslip: betslip
            });

            bet.save().then((doc) => {
                botResponse = {
                    "speech": `Bet placed. Your betslip id is: ${betslip}.`,
                    "displayText": `Bet has been placed.`,
                    "source": "betServiceApp"
                };
                res.status(200).send(botResponse);
            }, (e) => {
                res.status(400).send(e);
            });

*/