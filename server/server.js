// (Skype) appId:  5d3f999f-cf61-4a78-bef0-1d043021c96d 
// (Skype)  pass:  RU6FaWYMrwqLvhJukjdqZE5

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const axios = require('axios');
const querystring = require("querystring");

const { mongoose } = require('./db/mongoose');
const { Event } = require('./models/event');
const { Bet } = require('./models/bet');
const { BetType } = require('./models/bettype1');

const eventTypes = ['football', 'tennis', 'basketball'];

const app = express();
app.use(bodyParser.json());

var botResponse = {};

app.get('/betinfo', (req, res) => {
    var qBetType1 = req.query.bettype1;
    var qBetType2 = req.query.bettype2;

    var info = "";

    if (qBetType1 !== 'undefined') {
        BetType.find({ code: qBetType1 }).then((docs) => {
            _.each(docs, (doc) => {
                info+= `- ${doc.title} (code: ${doc.code}): \n\t${doc.description}\n`;
            });
            res.status(200).send(info);
        }).catch((e) => {
            console.log("Error: ", e);
            res.status(400).send("The service could not bring back any data.");
        });
    } 
});

app.post('/webhook', (req, res) => {
    //console.log(req.body);

    var action = req.body.result.action;
    console.log( 'Action is: ', action);
    var searchQuery = {};
    var selectionArray = [];
    switch (action) {
        case "betInfo":
            var bettype1 = req.body.result.parameters.BetType1;
            let varToSend = "";
            if (_.isArray(bettype1)) {
                _.each(bettype1, (item) => {
                    varToSend += `bettype1[]=${item}&`;
                });
                varToSend = varToSend.slice(0, -1);
                console.log(varToSend);
            } else {
                varToSend = `bettype1=${bettype1}`;
            }


            const bet_info_url = `http://127.0.0.1:8080/betinfo/?${varToSend}`;

            console.log("Sent:", bet_info_url);
            axios.get(bet_info_url).then((response) => {
                let botResponse = {
                    "speech": `${response.data}`,
                    "displayText": `${response.data}`,
                    "source": "betInfoServiceApp"
                };
                res.status(200).send(botResponse);
            }).catch((err) => {
                //console.log('Error: ', err);
                res.status(400).send(err);
            });
            break;
        case "betInfo.listBetTypes":
            var returnText = "";
            BetType1.find().then((docs) => {
                _.each(docs, (item) => {
                    returnText += `\n- ${item.title} (code: ${item.code})`;
                });
                let botResponse = {
                    "speech": `Certainly! Here are all bet types: ${returnText}.\nYou can ask about any of them.`,
                    "displayText": `Certainly! Here are all bet types: ${returnText}.\n You can ask about any of them.`,
                    "source": "betInfoServiceApp"
                };
                res.status(200).send(botResponse);
            });
        break;
        case "placeBet":
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
                console.log("DEV: All events");
            } else {
                console.log("DEV: ", eventType);
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
                        var selections = "";
                        _.each(item.selection, (result) => {
                            selections += `\t[${result.title} (${result.odds}) ${result.select_id}]\n`;
                            selectionArray.push(result);
                        });

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
                "source": "aiServiceApp"
            };
            res.status(200).send(botResponse);
    }
});

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.listen(server_port, () => {
    console.log(`Service started at ${server_ip_address}:${server_port}`);
});
