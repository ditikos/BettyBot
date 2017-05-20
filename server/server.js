// (Skype) appId:  5d3f999f-cf61-4a78-bef0-1d043021c96d 
// (Skype)  pass:  RU6FaWYMrwqLvhJukjdqZE5

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const { mongoose } = require('./db/mongoose');
const { Event } = require('./models/event');
const { Bet } = require('./models/bet');

const eventTypes = ['football', 'tennis', 'basketball'];

const app = express();
app.use(bodyParser.json());

var botResponse = {};

app.post('/webhook', (req, res) => {
    console.log(req.body);

    var action = req.body.result.action;
    var searchQuery = {};
    var selectionArray = [];
    switch (action) {
        case "placeBet":
            //console.log(req.body);
            //console.log(JSON.stringify(req.body.result.contexts));
            console.log(`Selection is: ${req.body.result.parameters.selection}, Stake is: ${JSON.stringify(req.body.result.parameters.stake,undefined,2)}`);
           var selection = req.body.result.parameters.selection;
           var amount = req.body.result.parameters.stake.amount;
           var currency = req.body.result.parameters.stake.currency;
           var d = new Date();
           var n = d.getTime();
           var betslip = `${selection}_${n}`;


            var bet = new Bet({
                selection: selection,
                amount: amount,
                currency: currency,
                odds: '4/1',
                betslip: betslip
            });

            bet.save().then((doc) => {
                console.log(doc);
                botResponse = {
                    "speech": `Bet placed. Your betslip id is: ${betslip}.`,
                    "displayText": `Bet has been placed.`,
                    "source": "betServiceApp"
                };
                res.status(200).send(botResponse);
            }, (e) => {
                console.log(e);
                res.status(400).send(e);
            });
           
        break;
        case "getEvents":
            let eventType = req.body.result.parameters.EventType;
            if (eventType === undefined || eventType.toUpperCase() == 'ALL' || eventType.toUpperCase() == 'SPORTS') {
                console.log("All events");
            } else {
                console.log(eventType);
                searchQuery = {
                    sport: eventType.toUpperCase()
                };
            }

            Event.find(searchQuery).then((events) => {
                if (events.length === 0) {
                    botResponse = {
                        "speech": `I haven't found any events of type ${eventType}...`,
                        "displayText": `I haven't found any events of type ${eventType}`,
                        "source": "eventServiceApp"
                    };
                } else {
                    let results = [];
                    _.each(events, (item) => {
                        //console.log(`Key: ${key} => ${value}`);
                        var selections = "";
                        _.each(item.selection, (result) => {
                            selections += `\t[${result.title} (${result.odds}) ${result.select_id}]\n`;
                            selectionArray.push(result);
                        });
                        //console.log(`Item: ${item.title}, Selection: ${selections}`);
                        //console.log(JSON.stringify(item, undefined, 2));
                        results += `${item.title} : \n${selections}\n`;
                    });
                    botResponse = {
                        "speech": `Displaying ${events.length} events:\n${results}\n\nWould you like to place a bet?`,
                        "displayText": `Displaying ${events.length} events...`,
                        "source": "eventServiceApp"
                    };
                }
                res.status(200).send(botResponse);
            }, (err) => {
                res.status(400).send(err);
            });
            break;
        default:
            botResponse = {
                "speech": "I did not get that quite...",
                "displayText": "I did not get that quite...",
                "source": "eventServiceApp"
            };
            res.status(200).send(botResponse);
    }
});

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.listen(server_port, () => {
    console.log(`Service started at ${server_ip_address}:${server_port}`);
});
