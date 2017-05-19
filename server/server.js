const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const { mongoose } = require('./db/mongoose');
const { Event } = require('./models/event');

const eventTypes = ['football', 'tennis', 'basketball'];

const app = express();
app.use(bodyParser.json());

var botResponse = {};

app.post('/webhook', (req, res) => {
    //console.log(req.body);

    var action = req.body.result.action;
    var searchQuery = {};
    var selectionArray = [];
    switch (action) {
        case "placeBet":
            console.log(req.body);
            console.log(JSON.stringify(req.body.result.contexts, undefined, 2));
        break;
        case "getEvents":
            let eventType = req.body.result.parameters.EventType;
            if (eventType === undefined || eventType.toUpperCase() == 'ALL') {
                console.log("All events");
            } else {
                console.log(eventType);
                searchQuery = {
                    sport: eventType.toUpperCase()
                };
            }

            //console.log(JSON.stringify(searchQuery, undefined, 2));

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
                        console.log(`Item: ${item.title}, Selection: ${selections}`);
                        //console.log(JSON.stringify(item, undefined, 2));
                        results += `${item.title} : \n${selections}\n`;
                    });
                    botResponse = {
                        "speech": `Displaying ${events.length} events:\n${results}`,
                        "displayText": `Displaying ${events.length} events...`,
                        "source": "eventServiceApp",
                        "contextOut": [{"name":"listOfEvents", "lifespan":2, "parameters":{"selections":selectionArray}}]
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

app.listen(9000, () => {
    console.log('Service started at 9000');
});
