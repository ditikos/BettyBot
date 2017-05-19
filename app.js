const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {mongoose} = require('mongoose');

const eventTypes = ['sports','football','tennis','basketball'];

const app = express();
app.use(bodyParser.json());

var botResponse = {};

app.post('/webhook', (req, res) => {
    console.log(req.body);

    var action = req.body.result.action;
    var found = false;
    switch (action) {
        case "getEvents":
            let eventType = req.body.result.parameters.EventType;
            found = _.findIndex(eventTypes, (item) => { return item == eventType;});

            if (found) {
                console.log("Found event Type!");
            }

            botResponse = {
                "speech": "Here is a list of events for today:",
                "displayText": "Here is a list of events for today:",
                "source": "eventServiceApp"
            }
            break;
        default:
            botResponse = {
                "speech": "I did not get that quite...",
                "displayText": "I did not get that quite...",
                "source": "eventServiceApp"
            }
    }

    res.status(200).send(botResponse);
});

app.listen(9000, () => {
    console.log('Service started at 9000');
});
